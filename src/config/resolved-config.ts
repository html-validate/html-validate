import fs from "node:fs";
import { type Source } from "../context";
import { ensureError, NestedError } from "../error";
import { type MetaTable } from "../meta";
import { type Plugin } from "../plugin";
import {
	getCachedTransformerFunction,
	type TransformContext,
	type Transformer,
} from "../transform";
import { type ConfigData, type RuleOptions } from "./config-data";
import { type Resolver } from "./resolver";
import { type Severity } from "./severity";

/**
 * @public
 */
export interface TransformerEntry {
	pattern: RegExp;
	name: string;
}

/**
 * @public
 */
export interface ResolvedConfigData {
	metaTable: MetaTable;
	plugins: Plugin[];
	rules: Map<string, [Severity, RuleOptions]>;
	transformers: TransformerEntry[];
}

/**
 * A resolved configuration is a normalized configuration with all extends,
 * plugins etc resolved.
 *
 * @public
 */
export class ResolvedConfig {
	private metaTable: MetaTable;
	private plugins: Plugin[];
	private rules: Map<string, [Severity, RuleOptions]>;
	private transformers: TransformerEntry[];
	private cache: Map<string, Transformer>;

	/** The original data this resolved configuration was created from */
	private original: ConfigData;

	/**
	 * @internal
	 */
	public constructor(
		{ metaTable, plugins, rules, transformers }: ResolvedConfigData,
		original: ConfigData,
	) {
		this.metaTable = metaTable;
		this.plugins = plugins;
		this.rules = rules;
		this.transformers = transformers;
		this.cache = new Map();
		this.original = original;
	}

	/**
	 * Returns the (merged) configuration data used to create this resolved
	 * configuration.
	 */
	public getConfigData(): ConfigData {
		return this.original;
	}

	public getMetaTable(): MetaTable {
		return this.metaTable;
	}

	public getPlugins(): Plugin[] {
		return this.plugins;
	}

	public getRules(): Map<string, [Severity, RuleOptions]> {
		return this.rules;
	}

	/**
	 * Transform a source.
	 *
	 * When transforming zero or more new sources will be generated.
	 *
	 * @internal
	 * @param source - Current source to transform.
	 * @param filename - If set it is the filename used to match
	 * transformer. Default is to use filename from source.
	 * @returns A list of transformed sources ready for validation.
	 */
	public transformSource(resolvers: Resolver[], source: Source, filename?: string): Source[] {
		const transformer = this.findTransformer(filename ?? source.filename);
		const context: TransformContext = {
			hasChain: (filename: string): boolean => {
				return !!this.findTransformer(filename);
			},
			chain: (source: Source, filename: string) => {
				return this.transformSource(resolvers, source, filename);
			},
		};
		if (!transformer) {
			return [source];
		}
		const fn = getCachedTransformerFunction(this.cache, resolvers, transformer.name, this.plugins);
		try {
			const transformedSources = Array.from(fn.call(context, source));
			for (const source of transformedSources) {
				/* keep track of which transformers that has been run on this source
				 * by appending this entry to the transformedBy array */
				source.transformedBy ??= [];
				source.transformedBy.push(transformer.name);
			}
			return transformedSources;
		} catch (err: unknown) {
			/* istanbul ignore next: only used as a fallback */
			const message = err instanceof Error ? err.message : String(err);
			throw new NestedError(`When transforming "${source.filename}": ${message}`, ensureError(err));
		}
	}

	/**
	 * Wrapper around [[transformSource]] which reads a file before passing it
	 * as-is to transformSource.
	 *
	 * @internal
	 * @param filename - Filename to transform (according to configured
	 * transformations)
	 * @returns A list of transformed sources ready for validation.
	 */
	public transformFilename(resolvers: Resolver[], filename: string): Source[] {
		const stdin = 0;
		const src = filename !== "/dev/stdin" ? filename : stdin;
		const data = fs.readFileSync(src, { encoding: "utf8" });
		const source: Source = {
			data,
			filename,
			line: 1,
			column: 1,
			offset: 0,
			originalData: data,
		};
		return this.transformSource(resolvers, source);
	}

	/**
	 * Returns true if a transformer matches given filename.
	 *
	 * @public
	 */
	public canTransform(filename: string): boolean {
		const entry = this.findTransformer(filename);
		return !!entry;
	}

	private findTransformer(filename: string): TransformerEntry | null {
		const match = this.transformers.find((entry: TransformerEntry) => entry.pattern.test(filename));
		return match ?? null;
	}
}
