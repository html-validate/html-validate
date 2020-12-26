import { MetaTable } from "../meta";

/**
 * A resolved configuration is a normalized configuration with all extends,
 * plugins etc resolved.
 */
export class ResolvedConfig {
	private metaTable: MetaTable;

	public constructor(metaTable: MetaTable) {
		this.metaTable = metaTable;
	}

	public getMetaTable(): MetaTable {
		return this.metaTable;
	}
}
