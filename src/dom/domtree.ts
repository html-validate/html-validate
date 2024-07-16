import { type Location } from "../context";
import { type MetaTable } from "../meta";
import { HtmlElement } from "./htmlelement";

/**
 * @public
 */
export class DOMTree {
	public readonly root: HtmlElement;
	private active: HtmlElement;
	public doctype: string | null;

	/**
	 * @internal
	 */
	public constructor(location: Location) {
		this.root = HtmlElement.rootNode(location);
		this.active = this.root;
		this.doctype = null;
	}

	/**
	 * @internal
	 */
	public pushActive(node: HtmlElement): void {
		this.active = node;
	}

	/**
	 * @internal
	 */
	public popActive(): void {
		if (this.active.isRootElement()) {
			/* root element should never be popped, continue as if nothing happened */
			return;
		}
		this.active = this.active.parent ?? this.root;
	}

	/**
	 * @internal
	 */
	public getActive(): HtmlElement {
		return this.active;
	}

	/**
	 * Resolve dynamic meta expressions.
	 *
	 * @internal
	 */
	public resolveMeta(table: MetaTable): void {
		this.visitDepthFirst((node: HtmlElement) => {
			table.resolve(node);
		});
	}

	public getElementsByTagName(tagName: string): HtmlElement[] {
		return this.root.getElementsByTagName(tagName);
	}

	public visitDepthFirst(callback: (node: HtmlElement) => void): void {
		this.root.visitDepthFirst(callback);
	}

	public find(callback: (node: HtmlElement) => boolean): HtmlElement | null {
		return this.root.find(callback);
	}

	public querySelector(selector: string): HtmlElement | null {
		return this.root.querySelector(selector);
	}

	public querySelectorAll(selector: string): HtmlElement[] {
		return this.root.querySelectorAll(selector);
	}
}
