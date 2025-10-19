import { type Location } from "../context";
import { DOMNode } from "./domnode";
import { DynamicValue } from "./dynamic-value";
import { NodeType } from "./nodetype";

const TEXT_NODE_NAME = "#text";

/**
 * Returns true if the node is a text node.
 *
 * @public
 */
export function isTextNode(node: DOMNode | null | undefined): node is TextNode {
	return Boolean(node && node.nodeType === NodeType.TEXT_NODE);
}

/**
 * Represents a text in the HTML document.
 *
 * Text nodes are appended as children of `HtmlElement` and cannot have childen
 * of its own.
 *
 * @public
 */
export class TextNode extends DOMNode {
	private readonly text: string | DynamicValue;

	/**
	 * @param text - Text to add. When a `DynamicValue` is used the expression is
	 * used as "text".
	 * @param location - Source code location of this node.
	 */
	public constructor(text: string | DynamicValue, location: Location) {
		super(NodeType.TEXT_NODE, TEXT_NODE_NAME, location);
		this.text = text;
	}

	/**
	 * Get the text from node.
	 */
	public override get textContent(): string {
		return this.text.toString();
	}

	/**
	 * Flag set to true if the attribute value is static.
	 */
	public get isStatic(): boolean {
		return !this.isDynamic;
	}

	/**
	 * Flag set to true if the attribute value is dynamic.
	 */
	public get isDynamic(): boolean {
		return this.text instanceof DynamicValue;
	}
}
