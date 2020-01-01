/**
 * Represents casing for a name, e.g. lowercase, uppercase, etc.
 */
export class CaseStyle {
	public name: string;
	private pattern: RegExp;

	/**
	 * @param style - Name of a valid case style.
	 */
	public constructor(style: string, ruleId: string) {
		[this.pattern, this.name] = this.parseStyle(style, ruleId);
	}

	/**
	 * Test if a text matches this case style.
	 */
	public match(text: string): boolean {
		return !!text.match(this.pattern);
	}

	private parseStyle(style: string, ruleId: string): [RegExp, string] {
		switch (style.toLowerCase()) {
			case "lowercase":
				return [/^[a-z]*$/, "lowercase"];
			case "uppercase":
				return [/^[A-Z]*$/, "uppercase"];
			case "pascalcase":
				return [/^[A-Z][A-Za-z]*$/, "PascalCase"];
			case "camelcase":
				return [/^[a-z][A-Za-z]*$/, "camelCase"];
			default:
				throw new Error(`Invalid style "${style}" for "${ruleId}" rule`);
		}
	}
}
