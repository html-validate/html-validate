import { type Attribute, type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type MetaAttribute, type MetaElement } from "../meta";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";
import { ariaNaming, isKeywordIgnored, keywordPatternMatcher } from "./helper";

export interface RuleContext {
	attr: "aria-label" | "aria-labelledby";
	allowsNaming: boolean;
}

export interface RuleOptions {
	allowAnyNamable: boolean;
	elements: {
		include: string[] | null;
		exclude: string[] | null;
	};
}

const defaults: RuleOptions = {
	allowAnyNamable: false,
	elements: {
		include: null,
		exclude: null,
	},
};

const allowlist = new Set([
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
]);

function isValidUsage(target: HtmlElement, meta: MetaElement): boolean {
	/* elements with explicit aria-label attribute are valid */
	const explicit = meta.attributes["aria-label"] as MetaAttribute | undefined;
	if (explicit) {
		return true;
	}

	/* landmark and other allowed elements are valid */
	if (allowlist.has(target.tagName)) {
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

	public static override schema(): SchemaObject {
		return {
			allowAnyNamable: {
				type: "boolean",
			},
			elements: {
				type: "object",
				properties: {
					include: {
						anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
					},
					exclude: {
						anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
					},
				},
				additionalProperties: false,
			},
		};
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
			for (const target of document.querySelectorAll("[aria-label], [aria-labelledby]")) {
				const ariaLabel = target.getAttribute("aria-label");
				if (ariaLabel) {
					this.validateElement(target, ariaLabel, "aria-label");
				}
				const ariaLabelledby = target.getAttribute("aria-labelledby");
				if (ariaLabelledby) {
					this.validateElement(target, ariaLabelledby, "aria-labelledby");
				}
			}
		});
	}

	private validateElement(
		target: HtmlElement,
		attr: Attribute,
		key: "aria-label" | "aria-labelledby",
	): void {
		if (!attr.value || attr.valueMatches("", false)) {
			return;
		}

		/* ignore elements without meta */
		const meta = target.meta;
		if (!meta) {
			return;
		}

		/* ignore elements matching filters */
		if (this.shouldIgnoreElement(target)) {
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

	private shouldIgnoreElement(target: HtmlElement): boolean {
		return isKeywordIgnored(this.options.elements, target.tagName, keywordPatternMatcher);
	}
}
