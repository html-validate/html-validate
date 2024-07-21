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

	function writeNode(node: HtmlElement, level: number, sibling: number): void {
		if (node.parent) {
			const indent = "  ".repeat(level - 1);
			const l = node.childElements.length > 0 ? "┬" : "─";
			const b = sibling < node.parent.childElements.length - 1 ? "├" : "└";
			lines.push(`${indent}${b}─${l} ${node.tagName}${decoration(node)}`);
		} else {
			lines.push("(root)");
		}

		node.childElements.forEach((child, index) => {
			writeNode(child, level + 1, index);
		});
	}

	writeNode(root, 0, 0);
	return lines;
}
