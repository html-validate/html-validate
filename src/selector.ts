import DOMNode from './domnode';

class Matcher {
	match(node: DOMNode): boolean {
		return false;
	}
}

class ClassMatcher extends Matcher {
	classname: string;

	constructor(classname: string){
		super();
		this.classname = classname;
	}

	match(node: DOMNode): boolean {
		return node.classList.contains(this.classname);
	}
}

class IdMatcher extends Matcher {
	id: string;

	constructor(id: string){
		super();
		this.id = id;
	}

	match(node: DOMNode): boolean {
		return node.getAttribute('id') === this.id;
	}
}

class AttrMatcher extends Matcher {
	key: string;
	op: string;
	value: string;

	constructor(attr: string){
		super();
		const [,key, op, value] = attr.match(/^([a-z]+)(?:([~^$*|]?=)"([a-z]+)")?$/);
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
			console.error(`Attribute selector operator ${this.op} is not implemented yet`);
			return false;
		}
	}
}

class Pattern {
	selector: string;
	combinator: string;
	tagName: string;
	pattern: Matcher[];

	constructor(pattern: string){
		const match = pattern.match(/^([+\->]?)((?:[*]|[^.#\[]+)?)(.*)$/);
		match.shift(); /* remove full matched string */
		this.selector = pattern;
		this.combinator = match.shift();
		this.tagName = match.shift() || '*';
		const p = match[0] ? match[0].split(/(?=[.#\[])/) : [];
		this.pattern = p.map((cur: string) => Pattern.createMatcher(cur));
	}

	match(node: DOMNode): boolean {
		return node.is(this.tagName) && this.pattern.every((cur: Matcher) => cur.match(node));
	}

	private static createMatcher(pattern: string): Matcher {
		switch(pattern[0]) {
		case '.':
			return new ClassMatcher(pattern.slice(1));
		case '#':
			return new IdMatcher(pattern.slice(1));
		case '[':
			return new AttrMatcher(pattern.slice(1, -1));
		default:
			console.error(`Failed to create matcher for "${pattern}"`);
			return new Matcher();
		}
	}
}

export class Selector {
	private pattern: Pattern[];

	constructor(selector: string){
		this.pattern = this.parse(selector);
	}

	*match(node: DOMNode, level: number = 0): IterableIterator<DOMNode> {
		const initial = this.pattern[0];
		const matches = node.getElementsByTagName(initial.tagName);

		for (const it of matches){
			let cur = it;
			if (initial.match(cur)){
			 	yield cur;
			}
		}
	}

	private parse(selector: string): Pattern[] {
		const pattern = selector.replace(/([+~>]) /, '$1').split(/ +/);
		return pattern.map((part: string) => new Pattern(part));
	}
}
