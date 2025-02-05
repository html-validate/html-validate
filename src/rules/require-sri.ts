import { type Attribute, type HtmlElement } from "../dom";
import { type TagEndEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

type Target = "all" | "crossorigin";

interface RuleOptions {
	target: Target;
	include: string[] | null;
	exclude: string[] | null;
}

const defaults: RuleOptions = {
	target: "all",
	include: null,
	exclude: null,
};

const crossorigin = new RegExp("^(\\w+://|//)"); /* e.g. https:// or // */
const supportSri: Record<string, string> = {
	link: "href",
	script: "src",
};
const supportedRel = ["stylesheet", "preload", "modulepreload"];
const supportedPreload = ["style", "script"];

function linkSupportsSri(node: HtmlElement): boolean {
	const rel = node.getAttribute("rel");
	if (typeof rel?.value !== "string") {
		return false;
	}
	if (!supportedRel.includes(rel.value)) {
		return false;
	}
	if (rel.value === "preload") {
		const as = node.getAttribute("as");
		return typeof as?.value === "string" && supportedPreload.includes(as.value);
	}
	return true;
}

export default class RequireSri extends Rule<void, RuleOptions> {
	private target: Target;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.target = this.options.target;
	}

	public static schema(): SchemaObject {
		return {
			target: {
				enum: ["all", "crossorigin"],
				type: "string",
			},
			include: {
				anyOf: [
					{
						items: {
							type: "string",
						},
						type: "array",
					},
					{
						type: "null",
					},
				],
			},
			exclude: {
				anyOf: [
					{
						items: {
							type: "string",
						},
						type: "array",
					},
					{
						type: "null",
					},
				],
			},
		};
	}

	public documentation(): RuleDocumentation {
		return {
			description: `Subresource Integrity (SRI) \`integrity\` attribute is required to prevent tampering or manipulation from Content Delivery Networks (CDN), rouge proxies,  malicious entities, etc.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:end", (event: TagEndEvent) => {
			/* only handle thats supporting and requires sri */
			const node = event.previous;
			if (!(this.supportSri(node) && this.needSri(node))) {
				return;
			}

			/* check if sri attribute is present */
			if (node.hasAttribute("integrity")) {
				return;
			}

			this.report(
				node,
				`SRI "integrity" attribute is required on <${node.tagName}> element`,
				node.location,
			);
		});
	}

	private supportSri(node: HtmlElement): boolean {
		return Object.keys(supportSri).includes(node.tagName);
	}

	private needSri(node: HtmlElement): boolean {
		if (node.is("link") && !linkSupportsSri(node)) {
			return false;
		}

		const attr = this.elementSourceAttr(node);
		if (!attr) {
			return false;
		}

		if (attr.value === null || attr.value === "" || attr.isDynamic) {
			return false;
		}

		const url = attr.value.toString();
		if (this.target === "all" || crossorigin.test(url)) {
			return !this.isIgnored(url);
		}

		return false;
	}

	private elementSourceAttr(node: HtmlElement): Attribute | null {
		const key = supportSri[node.tagName];
		return node.getAttribute(key);
	}

	private isIgnored(url: string): boolean {
		return this.isKeywordIgnored(url, (list, it) => {
			return list.some((pattern) => it.includes(pattern));
		});
	}
}
