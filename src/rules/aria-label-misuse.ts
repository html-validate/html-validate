import { type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type MetaElement } from "../meta";
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

function isValidUsage(target: HtmlElement, meta: MetaElement): boolean {
	/* elements with explicit aria-label attribute are valid */
	if (meta.attributes["aria-label"]) {
		return true;
	}

	/* landmark and other whitelisted elements are valid */
	if (whitelisted.includes(target.tagName)) {
		return true;
	}

	/* elements with role are valid, @todo check if the role is widget or landmark */
	if (target.hasAttribute("role")) {
		return true;
	}

	/* elements with tabindex (implicit interactive) are valid */
	if (target.hasAttribute("tabindex")) {
		return true;
	}

	/* interactive and labelable elements are valid */
	if (Boolean(meta.interactive) || Boolean(meta.labelable)) {
		return true;
	}

	return false;
}

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

	private validateElement(target: HtmlElement): void {
		/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- the
		 * earier [aria-label] selector ensures this is always present */
		const attr = target.getAttribute("aria-label")!;
		if (!attr.value || attr.valueMatches("", false)) {
			return;
		}

		/* ignore elements without meta */
		const meta = target.meta;
		if (!meta) {
			return;
		}

		/* ignore elements which is valid usage */
		if (isValidUsage(target, meta)) {
			return;
		}

		this.report(target, `"aria-label" cannot be used on this element`, attr.keyLocation);
	}
}
