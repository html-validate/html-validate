import { type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";
import { isAriaHidden } from "./helper/a11y";
import { isFocusable } from "./helper/is-focusable";

export type RuleContext = "parent" | "self";

export default class HiddenFocusable extends Rule<RuleContext> {
	public override documentation(context: RuleContext): RuleDocumentation {
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
				'  - Use `tabindex="-1"` to remove the element from tab order.',
				"  - Use `hidden`, `inert` or similar means to hide or disable the element.",
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
				if (isFocusable(element) && isAriaHidden(element)) {
					this.reportElement(element);
				}
			}
		});
	}

	private reportElement(element: HtmlElement): void {
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
