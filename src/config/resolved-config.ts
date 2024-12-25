import { type MetaTable } from "../meta";
import { type Plugin } from "../plugin";
import { type Transformer, type TransformerEntry } from "../transform";
import { type ConfigData, type RuleOptions } from "./config-data";
import { type Severity } from "./severity";

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

	/** The original data this resolved configuration was created from */
	private original: ConfigData;

	/**
	 * @internal
	 */
	public cache: Map<string, Transformer>;

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
