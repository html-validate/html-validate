import { type HtmlElement } from "../../dom";
import { type TagEndEvent } from "../../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../../rule";
import { inAccessibilityTree } from "../helper/a11y";

interface RuleOptions {
	allowEmpty: boolean;
	alias: string | string[];
}

const defaults: RuleOptions = {
	allowEmpty: true,
	alias: [],
};

function needsAlt(node: HtmlElement): boolean {
	if (node.is("img")) {
		return true;
	}

	if (node.is("input") && node.getAttributeValue("type") === "image") {
		return true;
	}

	return false;
}

function getTag(node: HtmlElement): string {
	return node.is("input")
		? `<input type="${/* istanbul ignore next */ node.getAttributeValue("type") ?? ""}">`
		: `<${node.tagName}>`;
}

export default class H37 extends Rule<void, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });

		/* ensure alias is array */
		if (!Array.isArray(this.options.alias)) {
			this.options.alias = [this.options.alias];
		}
	}

	public static schema(): SchemaObject {
		return {
			alias: {
				anyOf: [
					{
						items: {
							type: "string",
						},
						type: "array",
					},
					{
						type: "string",
					},
				],
			},
			allowEmpty: {
				type: "boolean",
			},
		};
	}

	public documentation(): RuleDocumentation {
		return {
			description:
				"Both HTML5 and WCAG 2.0 requires images to have a alternative text for each image.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:end", (event: TagEndEvent) => {
			const node = event.previous;

			/* only validate images */
			if (!needsAlt(node)) {
				return;
			}

			/* ignore images with aria-hidden="true" or role="presentation" */
			if (!inAccessibilityTree(node)) {
				return;
			}

			/* validate plain alt-attribute */
			if (
				Boolean(node.getAttributeValue("alt")) ||
				Boolean(node.hasAttribute("alt") && this.options.allowEmpty)
			) {
				return;
			}

			/* validate if any non-empty alias is present */
			for (const attr of this.options.alias) {
				if (node.getAttribute(attr)) {
					return;
				}
			}

			if (node.hasAttribute("alt")) {
				const attr = node.getAttribute("alt");
				/* istanbul ignore next */
				this.report(node, `${getTag(node)} cannot have empty "alt" attribute`, attr?.keyLocation);
			} else {
				this.report(node, `${getTag(node)} is missing required "alt" attribute`, node.location);
			}
		});
	}
}
