/* eslint-disable no-unused-vars */
import { LocationData } from './context';
import Config from './config';
import { Token } from './token';
/* eslint-enable no-unused-vars */

class DOMNode {
	children: Array<DOMNode>;
	tagName: string;
	parent: DOMNode
	attr: { [key: string]: string; };
	open: boolean;
	closed: boolean;
	selfClosed: boolean;
	voidElement: boolean;
	location: LocationData;

	constructor(tagName: string, parent?: DOMNode, location?: LocationData){
		this.children = [];
		this.tagName = tagName;
		this.parent = parent;
		this.attr = {};
		this.open = true;
		this.closed = false;
		this.selfClosed = false;
		this.voidElement = false;
		this.location = location;

		if (parent){
			parent.children.push(this);
		}
	}

	static rootNode() {
		return new DOMNode(undefined, undefined);
	}

	static fromTokens(startToken: Token, endToken: Token, parent: DOMNode, config: Config){
		const tagName = startToken.data[2];
		if (!tagName){
			throw new Error("tagName cannot be empty");
		}
		const node = new DOMNode(tagName, undefined, startToken.location);
		node.selfClosed = endToken.data[0] === '/>';
		node.voidElement = config.isVoidElement(node.tagName);
		node.open = startToken.data[1] !== '/';
		node.closed = node.selfClosed || node.voidElement;

		/* deferring setting the parent until open/closed is resolved so
		 * close tags isn't added to the parent. */
		if (node.open && parent){
			node.parent = parent;
			parent.children.push(node);
		}

		return node;
	}

	isRootElement(): boolean {
		return typeof(this.tagName) === 'undefined';
	}

	setAttribute(key: string, value: any){
		this.attr[key] = value;
	}

	getAttribute(key: string){
		return this.attr[key];
	}

	append(node: DOMNode){
		this.children.push(node);
	}

	getElementsByTagName(tagName: string): Array<DOMNode> {
		return this.children.reduce(function(matches, node){
			return matches.concat(node.tagName === tagName ? [node] : [], node.getElementsByTagName(tagName));
		}, []);
	}
}

export default DOMNode;
