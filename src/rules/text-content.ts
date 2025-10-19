import { type DOMNode, type HtmlElement, isTextNode } from "../dom";
import { type ElementReadyEvent } from "../event";
import { type MetaElement, TextContent as TextContentEnum } from "../meta";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";
import { classifyNodeText } from "./helper";
import { inAccessibilityTree } from "./helper/a11y";
import { TextClassification } from "./helper/text";

interface RuleContext {
	tagName: string;
	textContent?: TextContentEnum;
}

/**
 * Check if attribute is present and non-empty or dynamic.
 */
function hasNonEmptyAttribute(node: HtmlElement, key: string): boolean {
	const attr = node.getAttribute(key);
	return Boolean(attr?.valueMatches(/.+/, true));
}

/**
 * Check if element has default text.
 *
 * Only <input type="submit"> and <input type="reset"> at the moment.
 */
function hasDefaultText(node: HtmlElement): boolean {
	/* only input element have default text */
	if (!node.is("input")) {
		return false;
	}

	/* default text is not available if value attribute is present */
	if (node.hasAttribute("value")) {
		return false;
	}

	/* default text is only present when type is submit or reset */
	const type = node.getAttribute("type");
	return Boolean(type?.valueMatches(/submit|reset/, false));
}

function isNonEmptyText(node: DOMNode): boolean {
	if (isTextNode(node)) {
		return node.isDynamic || node.textContent.trim() !== "";
	} else {
		return false;
	}
}

/**
 * Walk nodes (depth-first, preorder) searching for accessible text. Children
 * hidden from accessibility tree are ignored.
 *
 * For each node the current conditions satisfies as accessible text:
 *
 * - Non-empty or dynamic `aria-label`
 * - Non-empty or dynamic `aria-labelledby` (reference not validated, use [[no-missing-references]]
 * - Image with non-empty or dynamic `alt` text
 * - Elements with default text
 */
function haveAccessibleText(node: HtmlElement): boolean {
	if (!inAccessibilityTree(node)) {
		return false;
	}

	/* check direct descendants for non-empty or dynamic text */
	const haveText = node.childNodes.some((child) => isNonEmptyText(child));
	if (haveText) {
		return true;
	}

	if (hasNonEmptyAttribute(node, "aria-label")) {
		return true;
	}

	if (hasNonEmptyAttribute(node, "aria-labelledby")) {
		return true;
	}

	if (node.is("img") && hasNonEmptyAttribute(node, "alt")) {
		return true;
	}

	if (hasDefaultText(node)) {
		return true;
	}

	return node.childElements.some((child: HtmlElement) => {
		return haveAccessibleText(child);
	});
}

export default class TextContent extends Rule<RuleContext> {
	public override documentation(context: RuleContext): RuleDocumentation {
		const doc: RuleDocumentation = {
			description: `The textual content for this element is not valid.`,
			url: ruleDocumentationUrl(__filename),
		};
		switch (context.textContent) {
			case TextContentEnum.NONE:
				doc.description = `The \`<${context.tagName}>\` element must not have textual content.`;
				break;
			case TextContentEnum.REQUIRED:
				doc.description = `The \`<${context.tagName}>\` element must have textual content.`;
				break;
			case TextContentEnum.ACCESSIBLE:
				doc.description = `The \`<${context.tagName}>\` element must have accessible text.`;
				break;
		}
		return doc;
	}

	private static filter(this: void, event: ElementReadyEvent): boolean {
		const { target } = event;

		/* skip elements without metadata */
		if (!target.meta) {
			return false;
		}

		/* skip elements without explicit and default textContent */
		const { textContent } = target.meta;
		if (!textContent || textContent === TextContentEnum.DEFAULT) {
			return false;
		}

		return true;
	}

	public setup(): void {
		this.on("element:ready", TextContent.filter, (event: ElementReadyEvent) => {
			const target = event.target as HtmlElement & { meta: MetaElement };
			const { textContent } = target.meta;
			switch (textContent) {
				case TextContentEnum.NONE:
					this.validateNone(target);
					break;
				case TextContentEnum.REQUIRED:
					this.validateRequired(target);
					break;
				case TextContentEnum.ACCESSIBLE:
					this.validateAccessible(target);
					break;
			}
		});
	}

	/**
	 * Validate element has empty text (inter-element whitespace is not considered text)
	 */
	private validateNone(node: HtmlElement & { meta: MetaElement }): void {
		if (classifyNodeText(node) === TextClassification.EMPTY_TEXT) {
			return;
		}
		this.reportError(node, node.meta, `${node.annotatedName} must not have text content`);
	}

	/**
	 * Validate element has any text (inter-element whitespace is not considered text)
	 */
	private validateRequired(node: HtmlElement & { meta: MetaElement }): void {
		if (classifyNodeText(node) !== TextClassification.EMPTY_TEXT) {
			return;
		}
		this.reportError(node, node.meta, `${node.annotatedName} must have text content`);
	}

	/**
	 * Validate element has accessible text (either regular text or text only
	 * exposed in accessibility tree via aria-label or similar)
	 */
	private validateAccessible(node: HtmlElement & { meta: MetaElement }): void {
		/* skip this element if the element isn't present in accessibility tree */
		if (!inAccessibilityTree(node)) {
			return;
		}

		/* if the element or a child has aria-label, alt or default text, etc the
		 * element has accessible text */
		if (haveAccessibleText(node)) {
			return;
		}

		this.reportError(node, node.meta, `${node.annotatedName} must have accessible text`);
	}

	private reportError(node: HtmlElement, meta: MetaElement, message: string): void {
		this.report(node, message, null, {
			tagName: node.tagName,
			textContent: meta.textContent,
		});
	}
}
