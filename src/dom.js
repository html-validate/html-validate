'use strict';

const DOMNode = require('./domnode').default;

class DOM {
	constructor(){
		this.root = DOMNode.rootNode();
		this.active = this.root;
	}

	pushActive(node){
		this.active = node;
	}

	popActive(){
		this.active = this.active.parent;
	}

	getActive(){
		return this.active;
	}
}

module.exports = DOM;
