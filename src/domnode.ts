class DOMNode {
	children: Array<DOMNode>;
	tagName: string;
	parent: DOMNode
	attr: { [key: string]: string; };
	selfClosed: boolean;
	voidElement: boolean;

	constructor(tagName: string, parent?: DOMNode){
		this.children = [];
		this.tagName = tagName;
		this.parent = parent;
		this.attr = {};
		this.selfClosed = false;
		this.voidElement = false;

		if ( parent ){
			parent.children.push(this);
		}
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

	getElementsByTagName(tagName: string) {
		return this.children.reduce(function(matches, node){
			return matches.concat(node.tagName === tagName ? [node] : [], node.getElementsByTagName(tagName));
		}, []);
	}
}

export default DOMNode;
