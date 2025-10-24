import { type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type MetaAttribute, type MetaElement } from "../meta";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";
import { ariaNaming } from "./helper";

export interface RuleContext {
	attr: "aria-label" | "aria-labelledby";
	allowsNaming: boolean;
}

export interface RuleOptions {
	allowAnyNamable: boolean;
}

const defaults: RuleOptions = {
	allowAnyNamable: false,
};

const allowlist = [
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
	"dialog",
	"form",
	"iframe",
	"img",
	"area",
	"fieldset",
	"summary",
	"figure",
];

function isValidUsage(target: HtmlElement, meta: MetaElement): boolean {
	/* elements with explicit aria-label attribute are valid */
	const explicit = meta.attributes["aria-label"] as MetaAttribute | undefined;
	if (explicit) {
		return true;
	}

	/* landmark and other allowed elements are valid */
	if (allowlist.includes(target.tagName)) {
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

export default class AriaLabelMisuse extends Rule<RuleContext, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public override documentation(context: RuleContext): RuleDocumentation {
		const valid = [
			"Interactive elements",
			"Labelable elements",
			"Landmark elements",
			"Elements with roles inheriting from widget",
			"`<area>`",
			"`<dialog>`",
			"`<form>` and `<fieldset>`",
			"`<iframe>`",
			"`<img>` and `<figure>`",
			"`<summary>`",
			"`<table>`, `<td>` and `<th>`",
		];
		const lines = valid.map((it) => `- ${it}`);
		const url = ruleDocumentationUrl(__filename);
		if (context.allowsNaming) {
			return {
				description: [
					`\`${context.attr}\` is strictly allowed but is not recommended to be used on this element.`,
					`\`${context.attr}\` can only be used on:`,
					"",
					...lines,
				].join("\n"),
				url,
			};
		} else {
			return {
				description: [`\`${context.attr}\` can only be used on:`, "", ...lines].join("\n"),
				url,
			};
		}
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			for (const target of document.querySelectorAll("[aria-label]")) {
				this.validateElement(target, "aria-label");
			}
			for (const target of document.querySelectorAll("[aria-labelledby]")) {
				this.validateElement(target, "aria-labelledby");
			}
		});
	}

	private validateElement(target: HtmlElement, key: "aria-label" | "aria-labelledby"): void {
		/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- the
		 * earlier [aria-label] or [aria-labelledby] selector ensures this is always
		 * present */
		const attr = target.getAttribute(key)!;
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

		const allowsNaming = ariaNaming(target) === "allowed";

		/* ignore elements where naming is allowed (but not recommended) if `allowAnyNamable` is enabled */
		if (allowsNaming && this.options.allowAnyNamable) {
			return;
		}

		const context: RuleContext = { attr: key, allowsNaming };
		if (allowsNaming) {
			this.report({
				node: target,
				location: attr.keyLocation,
				context,
				message: `"{{ attr }}" is strictly allowed but is not recommended to be used on this element`,
			});
		} else {
			this.report({
				node: target,
				location: attr.keyLocation,
				context,
				message: `"{{ attr }}" cannot be used on this element`,
			});
		}
	}
}
