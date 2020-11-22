import { Location } from "../context";
import { MetaTable } from "../meta";
import { HtmlElement } from "./htmlelement";

export class DOMTree {
	public readonly root: HtmlElement;
	private active: HtmlElement;
	public doctype?: string;

	public constructor(location: Location | null) {
		this.root = HtmlElement.rootNode(location);
		this.active = this.root;
		this.doctype = null;
	}

	public pushActive(node: HtmlElement): void {
		this.active = node;
	}

	public popActive(): void {
		if (this.active.isRootElement()) {
			/* root element should never be popped, continue as if nothing happened */
			return;
		}
		this.active = this.active.parent || this.root;
	}

	public getActive(): HtmlElement {
		return this.active;
	}

	/**
	 * Resolve dynamic meta expressions.
	 */
	public resolveMeta(table: MetaTable): void {
		this.visitDepthFirst((node: HtmlElement) => table.resolve(node));
	}

	public getElementsByTagName(tagName: string): HtmlElement[] {
		return this.root.getElementsByTagName(tagName);
	}

	public visitDepthFirst(callback: (node: HtmlElement) => void): void {
		this.root.visitDepthFirst(callback);
	}

	public find(callback: (node: HtmlElement) => boolean): HtmlElement {
		return this.root.find(callback);
	}

	public querySelector(selector: string): HtmlElement {
		return this.root.querySelector(selector);
	}

	public querySelectorAll(selector: string): HtmlElement[] {
		return this.root.querySelectorAll(selector);
	}
}
