import { Location } from "../context";

const DOCUMENT_NODE_NAME = "#document";

export enum NodeType {
	ELEMENT_NODE = 1,
	DOCUMENT_NODE = 9,
}

export class DOMNode {
	readonly location: Location;
	readonly nodeName: string;
	readonly nodeType: NodeType;

	/**
	 * Set of disabled rules for this node.
	 *
	 * Rules disabled by using directives are added here.
	 */
	private disabledRules: Set<string>;

	constructor(nodeName: string, location?: Location) {
		this.location = location;
		this.nodeName = nodeName || DOCUMENT_NODE_NAME;
		this.disabledRules = new Set();

		this.nodeType = NodeType.ELEMENT_NODE;
		if (!nodeName) {
			this.nodeType = NodeType.DOCUMENT_NODE;
		}
	}

	public isRootElement(): boolean {
		return this.nodeType === NodeType.DOCUMENT_NODE;
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
