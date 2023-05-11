import { type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

const whitelisted = [
	"main",
	"nav",
	"table",
	"td",
	"th",
	"aside",
	"header",
	"footer",
	"section",
	"article",
	"form",
	"img",
	"area",
	"fieldset",
	"summary",
	"figure",
];

export default class AriaLabelMisuse extends Rule {
	public documentation(): RuleDocumentation {
		const valid = [
			"Interactive elements",
			"Labelable elements",
			"Landmark elements",
			"Elements with roles inheriting from widget",
			"`<area>`",
			"`<form>` and `<fieldset>`",
			"`<iframe>`",
			"`<img>` and `<figure>`",
			"`<summary>`",
			"`<table>`, `<td>` and `<th>`",
		];
		const lines = valid.map((it) => `- ${it}\n`).join("");
		return {
			description: `\`aria-label\` can only be used on:\n\n${lines}`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			for (const target of document.querySelectorAll("[aria-label]")) {
				this.validateElement(target);
			}
		});
	}

	/* eslint-disable-next-line complexity -- technical debt */
	private validateElement(target: HtmlElement): void {
		const attr = target.getAttribute("aria-label");
		if (!attr || !attr.value || attr.valueMatches("", false)) {
			return;
		}

		/* ignore elements without meta */
		const meta = target.meta;
		if (!meta) {
			return;
		}

		/* ignore elements with explicit aria-label attribute */
		if (meta.attributes["aria-label"]) {
			return;
		}

		/* ignore landmark and other whitelisted elements */
		if (whitelisted.includes(target.tagName)) {
			return;
		}

		/* ignore elements with role, @todo check if the role is widget or landmark */
		if (target.hasAttribute("role")) {
			return;
		}

		/* ignore elements with tabindex (implicit interactive) */
		if (target.hasAttribute("tabindex")) {
			return;
		}

		/* ignore interactive and labelable elements */
		if (meta.interactive || meta.labelable) {
			return;
		}

		this.report(target, `"aria-label" cannot be used on this element`, attr.keyLocation);
	}
}
