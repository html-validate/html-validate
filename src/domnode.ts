'use strict';

class DOMNode {
	children: Array<DOMNode>;
	tagName: string;
	parent: DOMNode
	attr: { [key: string]: string; };
	selfClosed: boolean;
	voidElement: boolean;

	constructor(tagName, parent){
		this.children = [];
		this.tagName = tagName;
		this.parent = parent;
		this.attr = {};
		this.selfClosed = false;
		this.voidElement = false;
	}

	static rootNode() {
		return new DOMNode(undefined, undefined);
	}

	static fromTokens(startToken, endToken, parent, config){
		let node = new DOMNode(startToken.data[2], parent);
		node.selfClosed = endToken.data[0] === '/>';
		node.voidElement = DOMNode.isVoidElement(config, node.tagName);
		return node;
	}

	private static isVoidElement(config, tagName): boolean {
		return config.html.voidElements.indexOf(tagName.toLowerCase()) !== -1;
	}

	setAttribute(key, value){
		this.attr[key] = value;
	}

	getAttribute(key){
		return this.attr[key];
	}

	append(node){
		this.children.push(node);
	}
}

export default DOMNode;
