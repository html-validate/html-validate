import { MetaTable } from "../meta";
import { Plugin } from "../plugin";
import { RuleOptions } from "./config-data";
import { Severity } from "./severity";

export interface ResolvedConfigData {
	metaTable: MetaTable;
	plugins: Plugin[];
	rules: Map<string, [Severity, RuleOptions]>;
}

/**
 * A resolved configuration is a normalized configuration with all extends,
 * plugins etc resolved.
 */
export class ResolvedConfig {
	private metaTable: MetaTable;
	private plugins: Plugin[];
	private rules: Map<string, [Severity, RuleOptions]>;

	public constructor({ metaTable, plugins, rules }: ResolvedConfigData) {
		this.metaTable = metaTable;
		this.plugins = plugins;
		this.rules = rules;
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
}
