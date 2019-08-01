import { HtmlElement } from "../dom";
import { AttributeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

const defaults = {
	style: "lowercase",
	ignoreForeign: true,
};

class AttrCase extends Rule {
	private pattern: RegExp;
	private lettercase: string;

	constructor(options: object) {
		super(Object.assign({}, defaults, options));
		[this.pattern, this.lettercase] = parseStyle(this.options.style);
	}

	public documentation(): RuleDocumentation {
		return {
			description: `Attribute name must be ${this.options.style}.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			if (this.isIgnored(event.target)) {
				return;
			}

			const letters = event.key.replace(/[^a-z]+/gi, "");
			if (!letters.match(this.pattern)) {
				this.report(
					event.target,
					`Attribute "${event.key}" should be ${this.lettercase}`
				);
			}
		});
	}

	protected isIgnored(node: HtmlElement): boolean {
		if (this.options.ignoreForeign) {
			return node.meta && node.meta.foreign;
		} else {
			return false;
		}
	}
}

function parseStyle(style: string): [RegExp, string] {
	switch (style.toLowerCase()) {
		case "lowercase":
			return [/^[a-z]*$/, "lowercase"];
		case "uppercase":
			return [/^[A-Z]*$/, "uppercase"];
		default:
			throw new Error(`Invalid style "${style}" for "attr-case" rule`);
	}
}

module.exports = AttrCase;
