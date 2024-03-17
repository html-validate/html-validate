import { type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";
import { isAriaHidden, isHTMLHidden, isInert, isStyleHidden } from "./helper/a11y";

export type RuleContext = "parent" | "self";

export default class HiddenFocusable extends Rule<RuleContext> {
	public documentation(context: RuleContext): RuleDocumentation {
		const byParent =
			context === "parent"
				? " In this case it is being hidden by an ancestor with `aria-hidden.`"
				: "";
		return {
			description: [
				`\`aria-hidden\` cannot be used on focusable elements.${byParent}`,
				"",
				"When focusable elements are hidden with `aria-hidden` they are still reachable using conventional means such as a mouse or keyboard but won't be exposed to assistive technology (AT).",
				"This is often confusing for users of AT such as screenreaders.",
				"",
				"To fix this either:",
				"  - Remove `aria-hidden`.",
				"  - Remove the element from the DOM instead.",
				"  - Use the `hidden` attribute or similar means to hide the element.",
			].join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		const focusable = this.getTagsWithProperty("focusable");
		const selector = ["[tabindex]", ...focusable].join(",");
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			for (const element of document.querySelectorAll(selector)) {
				if (isHTMLHidden(element) || isInert(element) || isStyleHidden(element)) {
					continue;
				}
				if (isAriaHidden(element)) {
					this.validateElement(element);
				}
			}
		});
	}

	private validateElement(element: HtmlElement): void {
		const { meta } = element;
		const tabindex = element.getAttribute("tabindex");

		if (meta && !meta.focusable && !tabindex) {
			return;
		}

		const attribute = element.getAttribute("aria-hidden");
		const message = attribute
			? `aria-hidden cannot be used on focusable elements`
			: `aria-hidden cannot be used on focusable elements (hidden by ancestor element)`;
		const location = attribute ? attribute.keyLocation : element.location;
		const context = attribute ? "self" : "parent";
		this.report({
			node: element,
			message,
			location,
			context,
		});
	}
}
