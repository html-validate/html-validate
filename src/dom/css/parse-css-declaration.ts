import { DynamicValue } from "../dynamic-value";
import { type CSSStyleDeclaration } from "./css-style-declaration";

type PropertyValuePair = [property: string, value: string];

function getCSSDeclarations(value: string): PropertyValuePair[] {
	return value
		.trim()
		.split(";")
		.filter(Boolean)
		.map((it): PropertyValuePair => {
			const [property, value] = it.split(":", 2);
			return [property.trim(), value ? value.trim() : ""];
		});
}

/**
 * @internal
 */
export function parseCssDeclaration(value?: string | DynamicValue | null): CSSStyleDeclaration {
	if (!value || value instanceof DynamicValue) {
		return {};
	}
	const pairs = getCSSDeclarations(value);
	return Object.fromEntries(pairs);
}
