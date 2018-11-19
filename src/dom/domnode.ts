import { Location } from "../context";
import { NodeType } from "./nodetype";

const DOCUMENT_NODE_NAME = "#document";

let counter = 0;

/* istanbul ignore next: only for testing */
export function reset() {
	counter = 0;
}

export class DOMNode {
	public readonly nodeName: string;
	public readonly nodeType: NodeType;
	public readonly childNodes: DOMNode[];

	public readonly location: Location;
	public readonly unique: number;

	/**
	 * Set of disabled rules for this node.
	 *
	 * Rules disabled by using directives are added here.
	 */
	private disabledRules: Set<string>;

	/**
	 * Create a new DOMNode.
	 *
	 * @param nodeType - What node type to create.
	 * @param nodeName - What node name to use. For `HtmlElement` this corresponds
	 * to the tagName but other node types have specific predefined values.
	 * @param location - Source code location of this node.
	 */
	constructor(nodeType: NodeType, nodeName: string, location?: Location) {
		this.nodeType = nodeType;
		this.nodeName = nodeName || DOCUMENT_NODE_NAME;
		this.location = location;
		this.disabledRules = new Set();
		this.childNodes = [];
		this.unique = counter++;
	}

	/**
	 * Get the text (recursive) from all child nodes.
	 */
	public get textContent(): string {
		return this.childNodes.map(node => node.textContent).join("");
	}

	public append(node: DOMNode): void {
		this.childNodes.push(node);
	}

	public isRootElement(): boolean {
		return this.nodeType === NodeType.DOCUMENT_NODE;
	}

	/**
	 * Returns a DOMNode representing the first direct child node or `null` if the
	 * node has no children.
	 */
	public get firstChild(): DOMNode {
		return this.childNodes[0] || null;
	}

	/**
	 * Returns a DOMNode representing the last direct child node or `null` if the
	 * node has no children.
	 */
	public get lastChild(): DOMNode {
		return this.childNodes[this.childNodes.length - 1] || null;
	}

	/**
	 * Disable a rule for this node.
	 */
	public disableRule(ruleId: string): void {
		this.disabledRules.add(ruleId);
	}

	/**
	 * Enable a previously disabled rule for this node.
	 */
	public enableRule(ruleId: string): void {
		this.disabledRules.delete(ruleId);
	}

	/**
	 * Test if a rule is enabled for this node.
	 */
	public ruleEnabled(ruleId: string): boolean {
		return !this.disabledRules.has(ruleId);
	}
}
