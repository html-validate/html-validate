import path from "node:path";
import { type Config } from "../config/config";
import { type ConfigData, type RuleOptions, type RuleSeverity } from "../config/config-data";
import { ConfigLoader } from "../config/config-loader";
import { ResolvedConfig } from "../config/resolved-config";
import { type Resolver } from "../config/resolver";
import { esmResolver } from "../config/resolver/nodejs";
import { type Severity, parseSeverity } from "../config/severity";
import { type MetaDataTable, MetaTable } from "../meta";
import { type TransformerEntry } from "../transform";
import { findFlatConfigFile } from "./find-flat-config-file";
import { type FlatConfig, type FlatConfigObject } from "./flat-config";
import { loadFlatConfigFile } from "./load-flat-config-file";
import { type MergedFlatConfig, mergeFlatConfig } from "./merge-flat-config";

function isGlobalIgnore(block: FlatConfigObject): block is { ignores: string[] } {
	return (
		block.ignores !== undefined &&
		block.files === undefined &&
		block.elements === undefined &&
		block.plugins === undefined &&
		block.transform === undefined &&
		block.rules === undefined
	);
}

function matchesFile(block: FlatConfigObject, rel: string): boolean {
	if (block.ignores?.some((it) => path.matchesGlob(rel, it))) {
		return false;
	}

	if (!block.files) {
		return true;
	}

	/* patterns without a path separator are treated as matching anywhere in
	 * the tree */
	return block.files.some((it) => path.matchesGlob(rel, it.includes("/") ? it : `**/${it}`));
}

function configDataToFlatConfigObject(data: ConfigData | undefined): FlatConfigObject {
	if (!data) {
		return {};
	}

	const elements = data.elements?.filter((it) => typeof it !== "string");
	const plugins = data.plugins?.filter((it) => typeof it !== "string");
	const rules = data.rules;

	return {
		elements: elements as MetaDataTable[],
		plugins,
		rules,
	};
}

function buildResolvedConfig(merged: MergedFlatConfig, original: FlatConfig): ResolvedConfig {
	const metaTable = new MetaTable();
	for (const element of merged.elements) {
		metaTable.loadFromObject(element);
	}
	metaTable.init();

	const plugins = merged.plugins;

	const rules = new Map<string, [Severity, RuleOptions]>();
	for (const [ruleId, data] of Object.entries(merged.rules)) {
		let rawSeverity: RuleSeverity;
		let options: RuleOptions;
		if (!Array.isArray(data)) {
			rawSeverity = data;
			options = {};
		} else if (data.length === 1) {
			rawSeverity = data[0];
			options = {};
		} else {
			rawSeverity = data[0];
			options = data[1];
		}
		rules.set(ruleId, [parseSeverity(rawSeverity), options]);
	}

	const transformers: TransformerEntry[] = Object.entries(merged.transform).map(
		/* eslint-disable-next-line security/detect-non-literal-regexp -- transform patterns are user-provided regexp strings */
		([pattern, fn]) => ({ kind: "function" as const, pattern: new RegExp(pattern), function: fn }),
	);

	const resolvedData = { metaTable, plugins, rules, transformers };
	return new ResolvedConfig(resolvedData, original);
}

const defaultResolvers: Resolver[] = [esmResolver()];

/**
 * Configuration loader for the flat config format.
 *
 * Loads configuration from a `html-validate.config.*` file and applies
 * per-file glob filtering.
 *
 * @public
 * @since 11.5.0
 */
export class FlatConfigLoader extends ConfigLoader {
	private readonly configFilePath: string;
	private configCache: {
		/** all configuration blocks except global ignores */
		flatConfig: FlatConfigObject[];
		/** global ignore patterns */
		globalIgnores: string[];
	} | null;
	private fileCache: Map<string, ResolvedConfig>;

	/**
	 * @param configFilePath - Absolute path to the flat config file.
	 * @param resolvers - Resolvers to use.
	 */
	public constructor(configFilePath: string, resolvers: Resolver[] = defaultResolvers) {
		super(resolvers);
		this.configFilePath = configFilePath;
		this.configCache = null;
		this.fileCache = new Map();
	}

	/**
	 * Search `dir` and its ancestors for a flat config file and, if found,
	 * return a new `FlatConfigLoader` pointed at it.  Returns `null` when no
	 * config file can be found.
	 *
	 * @param dir - Directory to start searching from.
	 * @param resolvers - Resolvers to use.
	 */
	public static fromDirectory(dir: string, resolvers?: Resolver[]): FlatConfigLoader | null {
		const configFilePath = findFlatConfigFile(dir);
		if (!configFilePath) {
			return null;
		}
		return new FlatConfigLoader(configFilePath, resolvers);
	}

	/**
	 * Get configuration for the given filename.
	 *
	 * Do note that if `configOverride` is changed between calls the cache must be
	 * flushed in-between. This loader caches the final merged result.
	 *
	 * @param filename - Absolute or relative path to the file being validated.
	 * @param configOverride - Optional configuration to merge into the result.
	 */
	public override async getConfigFor(
		filename: string,
		configOverride?: ConfigData,
	): Promise<ResolvedConfig> {
		const cached = this.fileCache.get(filename);
		if (cached) {
			return cached;
		}

		const { flatConfig, globalIgnores } = await this.loadConfig();
		const configDir = path.dirname(this.configFilePath);
		const rel = path.relative(configDir, path.resolve(filename));

		/* normally `getConfigFor()` shouldn't be called for an ignored file but if
		 * it happens we just return an empty config */
		if (globalIgnores.some((p) => path.matchesGlob(rel, p))) {
			return buildResolvedConfig({ elements: [], plugins: [], transform: {}, rules: {} }, []);
		}

		/* convert the override to a flat config block */
		const overrideBlock = configDataToFlatConfigObject(configOverride);

		/* find and merge all matching blocks for this filename */
		const matchingBlocks = flatConfig.filter((block) => matchesFile(block, rel));
		const blocks = [...matchingBlocks, overrideBlock];
		const merged = mergeFlatConfig(blocks);

		/* resolve and cache result */
		const resolved = buildResolvedConfig(merged, blocks);
		this.fileCache.set(filename, resolved);
		return resolved;
	}

	/**
	 * Flush the cached flat config, forcing a reload on the next call.
	 */
	public override flushCache(handle?: string): void {
		if (handle) {
			this.fileCache.delete(handle);
		} else {
			this.configCache = null;
			this.fileCache = new Map();
		}
	}

	/* istanbul ignore next */
	protected override defaultConfig(): Config {
		return this.empty();
	}

	private async loadConfig(): Promise<{ flatConfig: FlatConfig; globalIgnores: string[] }> {
		if (this.configCache) {
			return this.configCache;
		}

		const raw = await loadFlatConfigFile(this.configFilePath);
		const flatConfig = raw.filter((block) => !isGlobalIgnore(block));
		const globalIgnores = raw.filter(isGlobalIgnore).flatMap((block) => block.ignores);

		this.configCache = { flatConfig, globalIgnores };
		return this.configCache;
	}
}
