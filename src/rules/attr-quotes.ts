import { ConfigError } from "../config/error";
import { type AttributeEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

type QuoteMark = '"' | "'";
enum QuoteStyle {
	SINGLE_QUOTE = "'",
	DOUBLE_QUOTE = '"',
	AUTO_QUOTE = "auto",
	ANY_QUOTE = "any",
}

export interface RuleStyleContext {
	error: "style";
	attr: string;
	expected: string;
	actual: string;
}

export interface RuleUnquotedContext {
	error: "unquoted";
	attr: string;
}

type RuleContext = RuleStyleContext | RuleUnquotedContext;

interface RuleOptions {
	style: "auto" | "single" | "double" | "any";
	unquoted: boolean;
}

const defaults: RuleOptions = {
	style: "auto",
	unquoted: false,
};

function describeError(context: RuleContext): string {
	switch (context.error) {
		case "style":
			return `Attribute \`${context.attr}\` must use \`${context.expected}\` instead of \`${context.actual}\`.`;
		case "unquoted":
			return `Attribute \`${context.attr}\` must not be unquoted.`;
	}
}

function describeStyle(style: QuoteStyle, unquoted: boolean): string {
	const description: string[] = [];
	switch (style) {
		case QuoteStyle.AUTO_QUOTE:
			description.push(
				"- quoted with double quotes `\"` unless the value contains double quotes in which case single quotes `'` should be used instead",
			);
			break;
		case QuoteStyle.ANY_QUOTE:
			description.push("- quoted with single quotes `'`");
			description.push('- quoted with double quotes `"`');
			break;
		case QuoteStyle.SINGLE_QUOTE:
		case QuoteStyle.DOUBLE_QUOTE: {
			const name = style === QuoteStyle.SINGLE_QUOTE ? "single" : "double";
			description.push(`- quoted with ${name} quotes \`${style}\``);
			break;
		}
	}
	if (unquoted) {
		description.push("- unquoted (if applicable)");
	}
	return `${description.join(" or\n")}\n`;
}

export default class AttrQuotes extends Rule<RuleContext, RuleOptions> {
	private style: QuoteStyle;

	public static override schema(): SchemaObject {
		return {
			style: {
				enum: ["auto", "double", "single", "any"],
				type: "string",
			},
			unquoted: {
				type: "boolean",
			},
		};
	}

	public override documentation(context: RuleContext): RuleDocumentation {
		const { style } = this;
		const { unquoted } = this.options;
		const description = [
			describeError(context),
			"",
			"Under the current configuration attributes must be:",
			"",
			describeStyle(style, unquoted),
		];
		return {
			description: description.join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.style = parseStyle(this.options.style);
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			/* ignore dynamically added attributes (original attribute is still
			 * validated) */
			if (event.originalAttribute) {
				return;
			}

			/* ignore attributes with no value */
			if (event.value === null) {
				return;
			}

			if (!event.quote) {
				if (!this.options.unquoted) {
					const message = `Attribute "${event.key}" using unquoted value`;
					const context: RuleUnquotedContext = {
						error: "unquoted",
						attr: event.key,
					};
					this.report(event.target, message, null, context);
				}
				return;
			}

			/* if the style is set to any we skip the rest of the rule as the only
			 * thing that matters is if the "unquoted" options triggers an error or
			 * not */
			if (this.style === QuoteStyle.ANY_QUOTE) {
				return;
			}

			const expected = this.resolveQuotemark(event.value.toString(), this.style);

			if (event.quote !== expected) {
				const message = `Attribute "${event.key}" used ${event.quote} instead of expected ${expected}`;
				const context: RuleStyleContext = {
					error: "style",
					attr: event.key,
					actual: event.quote,
					expected,
				};
				this.report(event.target, message, null, context);
			}
		});
	}

	private resolveQuotemark(
		value: string,
		style: Exclude<QuoteStyle, QuoteStyle.ANY_QUOTE>,
	): QuoteMark {
		if (style === QuoteStyle.AUTO_QUOTE) {
			return value.includes('"') ? "'" : '"';
		} else {
			return style;
		}
	}
}

function parseStyle(style: string): QuoteStyle {
	switch (style.toLowerCase()) {
		case "auto":
			return QuoteStyle.AUTO_QUOTE;
		case "double":
			return QuoteStyle.DOUBLE_QUOTE;
		case "single":
			return QuoteStyle.SINGLE_QUOTE;
		case "any":
			return QuoteStyle.ANY_QUOTE;
		/* istanbul ignore next: covered by schema validation */
		default:
			throw new ConfigError(`Invalid style "${style}" for "attr-quotes" rule`);
	}
}
