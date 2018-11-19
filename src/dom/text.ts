import { Location } from "../context";
import { DOMNode } from "./domnode";
import { NodeType } from "./nodetype";

const TEXT_NODE_NAME = "#text";

/**
 * Represents a text in the HTML document.
 *
 * Text nodes are appended as children of `HtmlElement` and cannot have childen
 * of its own.
 */
export class TextNode extends DOMNode {
	private readonly text: string;

	/**
	 * @param text - Text to add.
	 * @param location - Source code location of this node.
	 */
	constructor(text: string, location?: Location) {
		super(NodeType.TEXT_NODE, TEXT_NODE_NAME, location);
		this.text = text;
	}

	/**
	 * Get the text from node.
	 */
	public get textContent(): string {
		return this.text;
	}
}
