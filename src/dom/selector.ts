import { DOMNode } from './domnode';
import { Combinator, parseCombinator } from './combinator';

class Matcher {
	match(node: DOMNode): boolean { // eslint-disable-line no-unused-vars
		return false;
	}
}

class ClassMatcher extends Matcher {
	private readonly classname: string;

	constructor(classname: string){
		super();
		this.classname = classname;
	}

	match(node: DOMNode): boolean {
		return node.classList.contains(this.classname);
	}
}

class IdMatcher extends Matcher {
	private readonly id: string;

	constructor(id: string){
		super();
		this.id = id;
	}

	match(node: DOMNode): boolean {
		return node.getAttribute('id') === this.id;
	}
}

class AttrMatcher extends Matcher {
	private readonly key: string;
	private readonly op: string;
	private readonly value: string;

	constructor(attr: string){
		super();
		const [, key, op, value] = attr.match(/^([a-z]+)(?:([~^$*|]?=)"([a-z]+)")?$/);
		this.key = key;
		this.op = op;
		this.value = value;
	}

	match(node: DOMNode): boolean {
		const attr = node.getAttribute(this.key);
		switch (this.op){
		case undefined:
			return attr !== null;
		case '=':
			return attr === this.value;
		default:
			// eslint-disable-next-line no-console
			console.error(`Attribute selector operator ${this.op} is not implemented yet`);
			return false;
		}
	}
}

class Pattern {
	readonly combinator: Combinator;
	readonly tagName: string;
	private readonly selector: string;
	private readonly pattern: Matcher[];

	constructor(pattern: string){
		const match = pattern.match(/^([~+\->]?)((?:[*]|[^.#[]+)?)(.*)$/);
		match.shift(); /* remove full matched string */
		this.selector = pattern;
		this.combinator = parseCombinator(match.shift());
		this.tagName = match.shift() || '*';
		const p = match[0] ? match[0].split(/(?=[.#[])/) : [];
		this.pattern = p.map((cur: string) => Pattern.createMatcher(cur));
	}

	match(node: DOMNode): boolean {
		return node.is(this.tagName) && this.pattern.every((cur: Matcher) => cur.match(node));
	}

	private static createMatcher(pattern: string): Matcher {
		switch (pattern[0]){
		case '.':
			return new ClassMatcher(pattern.slice(1));
		case '#':
			return new IdMatcher(pattern.slice(1));
		case '[':
			return new AttrMatcher(pattern.slice(1, -1));
		default:
			// eslint-disable-next-line no-console
			console.error(`Failed to create matcher for "${pattern}"`);
			return new Matcher();
		}
	}
}

export class Selector {
	private readonly pattern: Pattern[];

	constructor(selector: string){
		this.pattern = Selector.parse(selector);
	}

	*match(root: DOMNode, level: number = 0): IterableIterator<DOMNode> {
		if (level >= this.pattern.length){
			yield root;
			return;
		}

		const pattern = this.pattern[level];
		const matches = Selector.findCandidates(root, pattern);

		for (const node of matches){
			if (!pattern.match(node)){
				continue;
			}

			yield* this.match(node, level + 1);
		}
	}

	private static parse(selector: string): Pattern[] {
		const pattern = selector.replace(/([+~>]) /, '$1').split(/ +/);
		return pattern.map((part: string) => new Pattern(part));
	}

	private static findCandidates(root: DOMNode, pattern: Pattern): DOMNode[] {
		switch (pattern.combinator){
		case Combinator.DESCENDANT:
			return root.getElementsByTagName(pattern.tagName);
		case Combinator.CHILD:
			return root.children.filter(node => node.is(pattern.tagName));
		case Combinator.ADJACENT_SIBLING:
			return Selector.findAdjacentSibling(root);
		case Combinator.GENERAL_SIBLING:
			return Selector.findGeneralSibling(root);
		default:
			return [];
		}
	}

	private static findAdjacentSibling(node: DOMNode): DOMNode[] {
		let adjacent = false;
		return node.siblings.filter(cur => {
			if (adjacent){
				adjacent = false;
				return true;
			}
			if (cur === node){
				adjacent = true;
			}
			return false;
		});
	}

	private static findGeneralSibling(node: DOMNode): DOMNode[] {
		let after = false;
		return node.siblings.filter(cur => {
			if (after){
				return true;
			}
			if (cur === node){
				after = true;
			}
			return false;
		});
	}
}
