import { AttributeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

type QuoteMark = '"' | "'";
enum QuoteStyle {
	SINGLE_QUOTE = "'",
	DOUBLE_QUOTE = '"',
	AUTO_QUOTE = "auto",
}

interface Options {
	style?: '"' | "'" | "auto";
	unquoted?: boolean;
}

const defaults: Options = {
	style: "auto",
	unquoted: false,
};

export default class AttrQuotes extends Rule<void, Options> {
	private style: QuoteStyle;

	public documentation(): RuleDocumentation {
		if (this.options.style === "auto") {
			return {
				description: `Attribute values are required to be quoted with doublequotes unless the attribute value itself contains doublequotes in which case singlequotes should be used.`,
				url: ruleDocumentationUrl(__filename),
			};
		} else {
			return {
				description: `Attribute values are required to be quoted with ${this.options.style}quotes.`,
				url: ruleDocumentationUrl(__filename),
			};
		}
	}

	public constructor(options: Options) {
		super(Object.assign({}, defaults, options));
		this.style = parseStyle(this.options.style);
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			/* ignore attributes with no value */
			if (typeof event.value === "undefined") {
				return;
			}

			if (typeof event.quote === "undefined") {
				if (this.options.unquoted === false) {
					this.report(event.target, `Attribute "${event.key}" using unquoted value`);
				}
				return;
			}

			const expected = this.resolveQuotemark(event.value.toString(), this.style);

			if (event.quote !== expected) {
				this.report(
					event.target,
					`Attribute "${event.key}" used ${event.quote} instead of expected ${expected}`
				);
			}
		});
	}

	private resolveQuotemark(value: string, style: QuoteStyle): QuoteMark {
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
		default:
			return QuoteStyle.DOUBLE_QUOTE;
	}
}
