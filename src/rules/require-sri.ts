import { Attribute, HtmlElement } from "../dom";
import { TagCloseEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

type Target = "all" | "crossorigin";

interface RuleOptions {
	target: Target;
}

const defaults: RuleOptions = {
	target: "all",
};

const crossorigin = new RegExp("^(\\w+://|//)"); /* e.g. https:// or // */
const supportSri: { [key: string]: string } = {
	link: "href",
	script: "src",
};

export default class RequireSri extends Rule<void, RuleOptions> {
	private target: Target;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.target = this.options.target;
	}

	public documentation(): RuleDocumentation {
		return {
			description: `Subresource Integrity (SRI) \`integrity\` attribute is required to prevent manipulation from Content Delivery Networks or other third-party hosting.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:close", (event: TagCloseEvent) => {
			/* only handle thats supporting and requires sri */
			const node = event.previous;
			if (!(this.supportSri(node) && this.needSri(node))) return;

			/* check if sri attribute is present */
			if (node.hasAttribute("integrity")) return;

			this.report(
				node,
				`SRI "integrity" attribute is required on <${node.tagName}> element`,
				node.location
			);
		});
	}

	private supportSri(node: HtmlElement): boolean {
		return Object.keys(supportSri).includes(node.tagName);
	}

	private needSri(node: HtmlElement): boolean {
		if (this.target === "all") return true;

		const attr = this.elementSourceAttr(node);
		if (!attr || attr.value === null || attr.isDynamic) {
			return false;
		}

		const url = attr.value.toString();
		return crossorigin.test(url);
	}

	private elementSourceAttr(node: HtmlElement): Attribute | null {
		const key = supportSri[node.tagName];
		return node.getAttribute(key);
	}
}
