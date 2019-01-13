export class DynamicValue {
	public readonly expr: string;

	constructor(expr: string) {
		this.expr = expr;
	}

	public toString(): string {
		return this.expr;
	}
}
