import { HtmlElement } from "../dom";
import { AttributeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";
import { CaseStyle, CaseStyleName } from "./helper/case-style";

interface RuleOptions {
	style: CaseStyleName | CaseStyleName[];
	ignoreForeign: boolean;
}

const defaults: RuleOptions = {
	style: "lowercase",
	ignoreForeign: true,
};

class AttrCase extends Rule<void, RuleOptions> {
	private style: CaseStyle;

	public constructor(options: RuleOptions) {
		super(Object.assign({}, defaults, options));
		this.style = new CaseStyle(this.options.style, "attr-case");
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

			/* ignore case for dynamic attributes, the original attributes will be
			 * checked instead (this prevents duplicated errors for the same source
			 * attribute) */
			if (event.originalAttribute) {
				return;
			}

			const letters = event.key.replace(/[^a-z]+/gi, "");
			if (!this.style.match(letters)) {
				this.report(
					event.target,
					`Attribute "${event.key}" should be ${this.style.name}`
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

module.exports = AttrCase;
