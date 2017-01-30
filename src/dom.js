'use strict';

const Node = require('./node');

class DOM {
	constructor(){
		this.root = Node.rootNode();
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
