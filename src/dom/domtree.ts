import { Location } from '../context';
import { DOMNode } from './domnode';
import { MetaTable } from '../meta';

export class DOMTree {
	readonly root: DOMNode;
	private active: DOMNode;
	public doctype?: string;

	constructor(location: Location){
		this.root = DOMNode.rootNode(location);
		this.active = this.root;
		this.doctype = null;
	}

	pushActive(node: DOMNode): void {
		this.active = node;
	}

	popActive(): void {
		if (this.active.isRootElement()){
			return; /* root element should never be popped, continue as if
			         * nothing happened */
		}
		this.active = this.active.parent;
	}

	getActive(): DOMNode {
		return this.active;
	}

	/**
	 * Resolve dynamic meta expressions.
	 */
	resolveMeta(table: MetaTable){
		this.visitDepthFirst((node: DOMNode) => table.resolve(node));
	}

	getElementsByTagName(tagName: string) {
		return this.root.getElementsByTagName(tagName);
	}

	visitDepthFirst(callback: (node: DOMNode) => void): void {
		this.root.visitDepthFirst(callback);
	}

	find(callback: (node: DOMNode) => boolean): DOMNode {
		return this.root.find(callback);
	}

	querySelector(selector: string): DOMNode {
		return this.root.querySelector(selector);
	}

	querySelectorAll(selector: string): DOMNode[] {
		return this.root.querySelectorAll(selector);
	}
}
