import { DOMNode } from './domnode';
import { Selector } from './selector';
import { MetaTable } from '../meta';

export class DOMTree {
	readonly root: DOMNode;
	private active: DOMNode;

	constructor(){
		this.root = DOMNode.rootNode();
		this.active = this.root;
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
		const it = this.querySelectorImpl(selector);
		return it.next().value || null;
	}

	querySelectorAll(selector: string): DOMNode[] {
		const it = this.querySelectorImpl(selector);
		return Array.from(it);
	}

	private *querySelectorImpl(selector: string): IterableIterator<DOMNode> {
		const pattern = new Selector(selector);
		yield* pattern.match(this.root);
	}
}
