import { HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Rule, RuleDocumentation } from "../rule";

const defaults = {
	allowEmpty: true,
	alias: [] as string[],
};

class ImgReqAlt extends Rule {
	documentation(): RuleDocumentation {
		return {
			description: "Both HTML5 and WCAG 2.0 requires images to have a alternative text for each image.",
			url: "https://html-validate.org/rules/img-req-alt.html",
		};
	}

	constructor(options: object){
		super(Object.assign({}, defaults, options));

		/* ensure alias is array */
		if (!Array.isArray(this.options.alias)){
			this.options.alias = [this.options.alias];
		}
	}

	setup(){
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const images = event.document.getElementsByTagName("img");
			images.forEach((node: HtmlElement) => {
				/* validate plain alt-attribute */
				const alt = node.getAttributeValue("alt");
				if (alt || (alt === "" && this.options.allowEmpty)){
					return;
				}

				/* validate if any non-empty alias is present */
				for (const attr of this.options.alias){
					if (node.getAttribute(attr)){
						return;
					}
				}

				this.report(node, "<img> is missing required alt attribute");
			});
		});
	}
}

module.exports = ImgReqAlt;
