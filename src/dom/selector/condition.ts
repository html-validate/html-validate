import { type Attribute } from "../attribute";
import { type HtmlElement } from "../htmlelement";
import { factory as pseudoClassFunction } from "../pseudoclass";
import { type SelectorContext } from "./selector-context";

/**
 * Homage to PHP: unescapes slashes.
 *
 * E.g. "foo\:bar" becomes "foo:bar"
 */
function stripslashes(value: string): string {
	return value.replace(/\\(.)/g, "$1");
}

/**
 * @internal
 */
export abstract class Condition {
	/**
	 * Returns `true` if given node matches.
	 */
	public abstract match(node: HtmlElement, context: SelectorContext): boolean;
}

/**
 * @internal
 */
export class ClassCondition extends Condition {
	private readonly classname: string;

	public constructor(classname: string) {
		super();
		this.classname = classname;
	}

	public match(node: HtmlElement): boolean {
		return node.classList.contains(this.classname);
	}
}

/**
 * @internal
 */
export class IdCondition extends Condition {
	private readonly id: string;

	public constructor(id: string) {
		super();
		this.id = stripslashes(id);
	}

	public match(node: HtmlElement): boolean {
		return node.id === this.id;
	}
}

/**
 * @internal
 */
export class AttributeCondition extends Condition {
	private readonly key: string;
	private readonly op: string | undefined;
	private readonly value: string | undefined;

	public constructor(attr: string) {
		super();
		const [, key, op, value] = /^(.+?)(?:([~^$*|]?=)"([^"]+?)")?$/.exec(attr)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion -- will always match
		this.key = key;
		this.op = op;
		this.value = typeof value === "string" ? stripslashes(value) : value;
	}

	public match(node: HtmlElement): boolean {
		const attr = node.getAttribute(this.key, true);
		return attr.some((cur: Attribute) => {
			switch (this.op) {
				case undefined:
					return true; /* attribute exists */
				case "=":
					/* eslint-disable-next-line sonarjs/different-types-comparison -- false positive */
					return cur.value === this.value;
				default:
					throw new Error(`Attribute selector operator ${this.op} is not implemented yet`);
			}
		});
	}
}

/**
 * @internal
 */
export class PseudoClassCondition extends Condition {
	private readonly name: string;
	private readonly args: string;

	public constructor(pseudoclass: string, context: string) {
		super();
		const match = /^([^(]+)(?:\((.*)\))?$/.exec(pseudoclass);
		if (!match) {
			throw new Error(`Missing pseudo-class after colon in selector pattern "${context}"`);
		}
		const [, name, args] = match;
		this.name = name;
		this.args = args;
	}

	public match(node: HtmlElement, context: SelectorContext): boolean {
		const fn = pseudoClassFunction(this.name, context);
		return fn(node, this.args);
	}
}
