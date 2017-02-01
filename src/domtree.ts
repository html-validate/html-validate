import DOMNode from './domnode';

class DOMTree {
	root: DOMNode;
	active: DOMNode;

	constructor(){
		this.root = DOMNode.rootNode();
		this.active = this.root;
	}

	pushActive(node): void {
		this.active = node;
	}

	popActive(): void {
		this.active = this.active.parent;
	}

	getActive(): DOMNode {
		return this.active;
	}
}

export default DOMTree;
