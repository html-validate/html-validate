import { type HtmlElement, DOMTree } from "../dom";

/**
 * @public
 * @since %version%
 */
export interface Walk {
	/**
	 * Visits all nodes in the tree starting at node or document in a depth-first
	 * (in-order) manner, i.e. any children will be visited before its parent.
	 *
	 * @public
	 * @since %version%
	 * @param root - Element or document to visit nodes from.
	 * @param callback - Callback executed for each node.
	 */
	depthFirst(this: void, root: HtmlElement | DOMTree, callback: (node: HtmlElement) => void): void;
}

function depthFirst(
	this: void,
	root: HtmlElement | DOMTree,
	callback: (node: HtmlElement) => void,
): void {
	if (root instanceof DOMTree) {
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
 * @since %version%
 */
export const walk: Walk = {
	depthFirst,
};
