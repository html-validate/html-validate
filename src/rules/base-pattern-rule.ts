import { type Location } from "../context";
import { type HtmlElement } from "../dom";
import { type ParsedPattern, type PatternName, parsePattern } from "../pattern";
import { type SchemaObject, Rule } from "../rule";
import { naturalJoin } from "../utils/natural-join";

/**
 * @internal
 */
export interface BasePatternRuleContext {
	value: string;
}

/**
 * @internal
 */
export interface BasePatternRuleOptions {
	pattern: PatternName | PatternName[];
}

function toArray<T>(value: T | T[]): T[] {
	return Array.isArray(value) ? value : [value];
}

/**
 * Base rule for any rule testing strings against patterns.
 *
 * @internal
 */
export abstract class BasePatternRule extends Rule<BasePatternRuleContext, BasePatternRuleOptions> {
	/** Attribute being tested */
	protected attr: string;

	/** Parsed configured patterns */
	protected patterns: ParsedPattern[];

	/**
	 * @param attr - Attribute holding the value.
	 * @param options - Rule options with defaults expanded.
	 */
	public constructor(attr: string, options: BasePatternRuleOptions) {
		super(options);
		const { pattern } = this.options;
		this.attr = attr;
		this.patterns = toArray(pattern).map((it) => parsePattern(it));
	}

	public static schema(): SchemaObject {
		return {
			pattern: {
				oneOf: [{ type: "array", items: { type: "string" }, minItems: 1 }, { type: "string" }],
			},
		};
	}

	protected description(context: BasePatternRuleContext): string {
		const { attr, patterns } = this;
		const { value } = context;
		const lead =
			patterns.length === 1
				? `The \`${attr}\` attribute value \`"${value}"\` does not match the configured pattern.`
				: `The \`${attr}\` attribute value \`"${value}"\` does not match either of the configured patterns.`;
		return [
			lead,
			"For consistency within the codebase the `${attr}` is required to match one or more of the following patterns:",
			"",
			...patterns.map((it) => `- \`${it.description}\``),
		].join("\n");
	}

	protected validateValue(node: HtmlElement, value: string, location: Location | null): void {
		const { attr, patterns } = this;
		const matches = patterns.some((it) => it.regexp.test(value));
		if (matches) {
			return;
		}
		const allowed = naturalJoin(patterns.map((it) => `"${it.description}"`));
		const message =
			patterns.length === 1
				? `${attr} "${value}" does not match the configured pattern ${allowed}`
				: `${attr} "${value}" does not match either of the configured patterns: ${allowed}`;
		this.report({
			node,
			message,
			location,
			context: {
				value,
			},
		});
	}
}
