import { MetaTable } from "../meta";
import { RuleOptions } from "./config-data";
import { Severity } from "./severity";

/**
 * A resolved configuration is a normalized configuration with all extends,
 * plugins etc resolved.
 */
export class ResolvedConfig {
	private metaTable: MetaTable;
	private rules: Map<string, [Severity, RuleOptions]>;

	public constructor(metaTable: MetaTable, rules: Map<string, [Severity, RuleOptions]>) {
		this.metaTable = metaTable;
		this.rules = rules;
	}

	public getMetaTable(): MetaTable {
		return this.metaTable;
	}

	public getRules(): Map<string, [Severity, RuleOptions]> {
		return this.rules;
	}
}
