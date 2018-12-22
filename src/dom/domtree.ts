import { Location } from "../context";
import { MetaTable } from "../meta";
import { HtmlElement } from "./htmlelement";

export class DOMTree {
	readonly root: HtmlElement;
	private active: HtmlElement;
	public doctype?: string;

	constructor(location: Location){
		this.root = HtmlElement.rootNode(location);
		this.active = this.root;
		this.doctype = null;
	}

	pushActive(node: HtmlElement): void {
		this.active = node;
	}

	popActive(): void {
		if (this.active.isRootElement()){
			return; /* root element should never be popped, continue as if
			         * nothing happened */
		}
		this.active = this.active.parent;
	}

	getActive(): HtmlElement {
		return this.active;
	}

	/**
	 * Resolve dynamic meta expressions.
	 */
	resolveMeta(table: MetaTable){
		this.visitDepthFirst((node: HtmlElement) => table.resolve(node));
	}

	getElementsByTagName(tagName: string) {
		return this.root.getElementsByTagName(tagName);
	}

	visitDepthFirst(callback: (node: HtmlElement) => void): void {
		this.root.visitDepthFirst(callback);
	}

	find(callback: (node: HtmlElement) => boolean): HtmlElement {
		return this.root.find(callback);
	}

	querySelector(selector: string): HtmlElement {
		return this.root.querySelector(selector);
	}

	querySelectorAll(selector: string): HtmlElement[] {
		return this.root.querySelectorAll(selector);
	}
}
