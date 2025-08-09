import { type HtmlElement } from "../../dom";
import { type DOMReadyEvent } from "../../event";
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
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			const nodes = document.querySelectorAll("img");
			for (const node of nodes) {
				this.validateNode(node);
			}
		});
	}

	private validateNode(node: HtmlElement): void {
		/* ignore images with aria-hidden="true" or role="presentation" */
		if (!inAccessibilityTree(node)) {
			return;
		}

		/* validate plain alt-attribute */
		if (
			Boolean(node.getAttributeValue("alt")) ||
			(node.hasAttribute("alt") && this.options.allowEmpty)
		) {
			return;
		}

		/* validate if any non-empty alias is present */
		for (const attr of this.options.alias) {
			if (node.getAttribute(attr)) {
				return;
			}
		}

		const tag = node.annotatedName;
		if (node.hasAttribute("alt")) {
			/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we just verified presence with hasAttribute */
			const attr = node.getAttribute("alt")!;
			/* istanbul ignore next */
			this.report(node, `${tag} cannot have empty "alt" attribute`, attr.keyLocation);
		} else {
			this.report(node, `${tag} is missing required "alt" attribute`, node.location);
		}
	}
}
