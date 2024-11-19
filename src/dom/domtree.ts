import { type Location } from "../context";
import { type MetaTable } from "../meta";
import { walk } from "../utils";
import { HtmlElement } from "./htmlelement";

/**
 * @public
 */
export class DOMTree {
	public readonly root: HtmlElement;
	private active: HtmlElement;
	private _readyState: "loading" | "complete";
	public doctype: string | null;

	/**
	 * @internal
	 */
	public constructor(location: Location) {
		this.root = HtmlElement.rootNode(location);
		this.active = this.root;
		this.doctype = null;
		this._readyState = "loading";
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
		/* istanbul ignore next: If we reach this the active element is not the root
		 * element and thus would always have a parent (the document element if
		 * nothing else). But typescript doesn't know that. Keeping the fallback
		 * just in case we ever do get in a situation where this isn't true */
		this.active = this.active.parent ?? this.root;
	}

	/**
	 * @internal
	 */
	public getActive(): HtmlElement {
		return this.active;
	}

	/**
	 * Describes the loading state of the document.
	 *
	 * When `"loading"` it is still not safe to use functions such as
	 * `querySelector` or presence of attributes, child nodes, etc.
	 */
	public get readyState(): "loading" | "complete" {
		return this._readyState;
	}

	/**
	 * Resolve dynamic meta expressions.
	 *
	 * @internal
	 */
	public resolveMeta(table: MetaTable): void {
		this._readyState = "complete";
		walk.depthFirst(this, (node: HtmlElement) => {
			table.resolve(node);
		});
	}

	public getElementsByTagName(tagName: string): HtmlElement[] {
		return this.root.getElementsByTagName(tagName);
	}

	/**
	 * @deprecated use utility function `walk.depthFirst(..)` instead (since 8.21.0).
	 */
	public visitDepthFirst(callback: (node: HtmlElement) => void): void {
		walk.depthFirst(this, callback);
	}

	/**
	 * @deprecated use `querySelector(..)` instead (since 8.21.0)
	 */
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
