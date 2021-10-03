/**
 * @public
 */
export class DynamicValue {
	public readonly expr: string;

	public constructor(expr: string) {
		this.expr = expr;
	}

	public toString(): string {
		return this.expr;
	}
}
