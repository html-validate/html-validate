'use strict';

class Node {
	constructor(tagName, parent){
		this.children = [];
		this.tagName = tagName;
		this.parent = parent;
		this.attr = {};
	}

	static rootNode(){
		return new Node();
	}

	static fromToken(token, parent, config){
		let node = new Node(token.data[2], parent);
		node.selfClosed = !!token.data[3];
		node.voidElement = Node.isVoidElement(config, node.tagName);
		return node;
	}

	static isVoidElement(config, tagName){
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

module.exports = Node;
