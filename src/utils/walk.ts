import { type DOMTree, type HtmlElement } from "../dom";

/**
 * @public
 * @since 8.21.0
 */
export interface Walk {
	/**
	 * Visits all nodes in the tree starting at node or document in a depth-first
	 * (in-order) manner, i.e. any children will be visited before its parent.
	 *
	 * @public
	 * @since 8.21.0
	 * @param root - Element or document to visit nodes from.
	 * @param callback - Callback executed for each node.
	 */
	depthFirst(this: void, root: HtmlElement | DOMTree, callback: (node: HtmlElement) => void): void;
}

function isDOMTree(value: HtmlElement | DOMTree): value is DOMTree {
	return "root" in value && "readyState" in value;
}

function depthFirst(
	this: void,
	root: HtmlElement | DOMTree,
	callback: (node: HtmlElement) => void,
): void {
	if (isDOMTree(root)) {
		if (root.readyState !== "complete") {
			throw new Error(`Cannot call walk.depthFirst(..) before document is ready`);
		}
		root = root.root;
	}

	function visit(node: HtmlElement): void {
		node.childElements.forEach(visit);
		if (!node.isRootElement()) {
			callback(node);
		}
	}

	visit(root);
}

/**
 * Helper functions to walk the DOM tree.
 *
 * @public
 * @since 8.21.0
 */
export const walk: Walk = {
	depthFirst,
};
