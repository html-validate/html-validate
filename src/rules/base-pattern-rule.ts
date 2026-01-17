import { type Location } from "../context";
import { type HtmlElement } from "../dom";
import {
	type NamedPattern,
	type ParsedPattern,
	type Pattern,
	isNamedPattern,
	parsePattern,
} from "../pattern";
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
	pattern: Pattern | RegExp | ReadonlyArray<Pattern | RegExp>;
}

function toArray<T>(value: T | readonly T[]): readonly T[] {
	if (Array.isArray(value)) {
		return value as readonly T[];
	} else {
		return [value] as readonly T[];
	}
}

/**
 * @internal
 */
export function validateAllowedPatterns(
	patterns: ReadonlyArray<Pattern | RegExp>,
	allowedPatterns: Set<NamedPattern>,
	ruleId: string,
): void {
	const extraneous = patterns.filter(isNamedPattern).filter((p) => !allowedPatterns.has(p));
	if (extraneous.length > 0) {
		const quote = (it: string): string => `"${it}"`;
		const disallowed = naturalJoin(extraneous.map(quote), "and");
		const allowed = naturalJoin(Array.from(allowedPatterns, quote), "and");
		throw new Error(
			`Pattern ${disallowed} cannot be used with "${ruleId}". Allowed patterns: ${allowed}`,
		);
	}
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

	public constructor({
		ruleId,
		attr,
		options,
		allowedPatterns,
	}: {
		/** Rule ID for error messages */
		ruleId: string;
		/** Attribute holding the value. */
		attr: string;
		/** Rule options with defaults expanded. */
		options: BasePatternRuleOptions;
		/** List of allowed pattern names */
		allowedPatterns: Set<NamedPattern>;
	}) {
		super(options);
		const { pattern } = this.options;
		this.attr = attr;

		const patterns = toArray(pattern);
		validateAllowedPatterns(patterns, allowedPatterns, ruleId);

		this.patterns = patterns.map((it) => parsePattern(it));
	}

	public static override schema(): SchemaObject {
		return {
			pattern: {
				anyOf: [
					{ type: "array", items: { anyOf: [{ type: "string" }, { regexp: true }] }, minItems: 1 },
					{ type: "string" },
					{ regexp: true },
				],
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
