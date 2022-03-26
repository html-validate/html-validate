import { ConfigError } from "../../config/error";

export type CaseStyleName = "lowercase" | "uppercase" | "pascalcase" | "camelcase";

interface Style {
	pattern: RegExp;
	name: string;
}

/**
 * Represents casing for a name, e.g. lowercase, uppercase, etc.
 */
export class CaseStyle {
	private styles: Style[];

	/**
	 * @param style - Name of a valid case style.
	 */
	public constructor(style: CaseStyleName | CaseStyleName[], ruleId: string) {
		if (!Array.isArray(style)) {
			style = [style];
		}
		if (style.length === 0) {
			throw new ConfigError(`Missing style for ${ruleId} rule`);
		}
		this.styles = this.parseStyle(style, ruleId);
	}

	/**
	 * Test if a text matches this case style.
	 */
	public match(text: string): boolean {
		return this.styles.some((style) => text.match(style.pattern));
	}

	public get name(): string {
		const names = this.styles.map((style) => style.name);
		switch (this.styles.length) {
			case 1:
				return names[0];
			case 2:
				return names.join(" or ");
			default: {
				const last = names.slice(-1);
				const rest = names.slice(0, -1);
				return `${rest.join(", ")} or ${last[0]}`;
			}
		}
	}

	private parseStyle(style: CaseStyleName[], ruleId: string): Style[] {
		return style.map((cur: string): Style => {
			switch (cur.toLowerCase()) {
				case "lowercase":
					return { pattern: /^[a-z]*$/, name: "lowercase" };
				case "uppercase":
					return { pattern: /^[A-Z]*$/, name: "uppercase" };
				case "pascalcase":
					return { pattern: /^[A-Z][A-Za-z]*$/, name: "PascalCase" };
				case "camelcase":
					return { pattern: /^[a-z][A-Za-z]*$/, name: "camelCase" };
				default:
					throw new ConfigError(`Invalid style "${cur}" for ${ruleId} rule`);
			}
		});
	}
}
