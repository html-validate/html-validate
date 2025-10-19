import { type HtmlElement } from "../dom";
import { type ElementReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class SvgFocusable extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description: `Inline SVG elements in IE are focusable by default which may cause issues with tab-ordering. The \`focusable\` attribute should explicitly be set to avoid unintended behaviour.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("element:ready", (event: ElementReadyEvent) => {
			if (event.target.is("svg")) {
				this.validate(event.target);
			}
		});
	}

	private validate(svg: HtmlElement): void {
		if (svg.hasAttribute("focusable")) {
			return;
		}

		this.report(svg, `<${svg.tagName}> is missing required "focusable" attribute`);
	}
}
