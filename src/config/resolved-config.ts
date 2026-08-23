import { type FlatConfig } from "../flat-config";
import { type MetaTable } from "../meta";
import { type Plugin } from "../plugin";
import { type Transformer, type TransformerEntry } from "../transform";
import { type AriaVersion } from "./aria-version";
import { type ConfigData } from "./config-data";
import { type RuleOptions } from "./rule-options";
import { type Severity } from "./severity";

/**
 * @public
 */
export interface ResolvedConfigData {
	metaTable: MetaTable;
	plugins: Plugin[];
	rules: Map<string, [Severity, RuleOptions]>;
	transformers: TransformerEntry[];
	ariaVersion: AriaVersion;
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
	private ariaVersion: AriaVersion;

	/** The original data this resolved configuration was created from */
	private original: ConfigData | FlatConfig;

	/**
	 * @internal
	 */
	public cache: Map<string, Transformer>;

	/**
	 * @internal
	 */
	public constructor(options: ResolvedConfigData, original: ConfigData | FlatConfig) {
		const { metaTable, plugins, rules, transformers, ariaVersion } = options;
		this.metaTable = metaTable;
		this.plugins = plugins;
		this.rules = rules;
		this.transformers = transformers;
		this.ariaVersion = ariaVersion;
		this.cache = new Map();
		this.original = original;
	}

	/**
	 * Returns the (merged) configuration data used to create this resolved
	 * configuration.
	 */
	public getConfigData(): ConfigData | FlatConfig {
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
	 * Returns the configured ARIA specification version.
	 *
	 * @public
	 * @since 11.10.0
	 */
	public getAriaVersion(): AriaVersion {
		return this.ariaVersion;
	}

	/**
	 * Returns true if a transformer matches given filename.
	 *
	 * @public
	 */
	public canTransform(filename: string): boolean {
		return Boolean(this.findTransformer(filename));
	}

	/**
	 * @internal
	 */
	public findTransformer(filename: string): TransformerEntry | null {
		const match = this.transformers.find((entry: TransformerEntry) => entry.pattern.test(filename));
		return match ?? null;
	}
}
