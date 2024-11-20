import { type HtmlElement } from "../dom";

/**
 * Output DOM tree as string
 *
 * Mostly useful for debugging.
 *
 * @internal
 */
export function dumpTree(root: HtmlElement): string[] {
	const lines: string[] = [];

	function decoration(node: HtmlElement): string {
		let output = "";
		if (node.id) {
			output += `#${node.id}`;
		}
		if (node.hasAttribute("class")) {
			output += `.${node.classList.join(".")}`;
		}
		return output;
	}

	function writeNode(node: HtmlElement, level: number, indent: string, sibling: number): void {
		const numSiblings = node.parent ? node.parent.childElements.length : 0;
		const lastSibling = sibling === numSiblings - 1;
		if (node.parent) {
			const b = lastSibling ? "└" : "├";
			lines.push(`${indent}${b}── ${node.tagName}${decoration(node)}`);
		} else {
			lines.push("(root)");
		}

		node.childElements.forEach((child, index) => {
			const s = lastSibling ? " " : "│";
			const i = level > 0 ? `${indent}${s}   ` : "";
			writeNode(child, level + 1, i, index);
		});
	}

	writeNode(root, 0, "", 0);
	return lines;
}
