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
	return value.replaceAll(/\\(.)/g, "$1");
}

/**
 * @internal
 */
export interface ClassCondition {
	readonly kind: "class";
	readonly classname: string;
	match(node: HtmlElement, context: SelectorContext): boolean;
}

/**
 * @internal
 */
export interface IdCondition {
	readonly kind: "id";
	readonly id: string;
	match(node: HtmlElement, context: SelectorContext): boolean;
}

/**
 * @internal
 */
export interface AttributeCondition {
	readonly kind: "attribute";
	readonly key: string;
	readonly op: string | undefined;
	readonly value: string | undefined;
	match(node: HtmlElement, context: SelectorContext): boolean;
}

/**
 * @internal
 */
export interface PseudoClassCondition {
	readonly kind: "pseudo";
	readonly name: string;
	readonly args: string | undefined;
	match(node: HtmlElement, context: SelectorContext): boolean;
}

/**
 * @internal
 */
export type Condition = ClassCondition | IdCondition | AttributeCondition | PseudoClassCondition;

/**
 * @internal
 */
export function createClassCondition(classname: string): ClassCondition {
	return {
		kind: "class",
		classname,
		match(node) {
			return node.classList.contains(classname);
		},
	};
}

/**
 * @internal
 */
export function createIdCondition(raw: string): IdCondition {
	const id = stripslashes(raw);
	return {
		kind: "id",
		id,
		match(node) {
			return node.id === id;
		},
	};
}

/**
 * @internal
 */
export function createAttributeCondition(attr: string): AttributeCondition {
	const match = /^(.+?)(?:([$*^|~]?=)"([^"]+?)")?$/.exec(attr)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion -- will always match
	const key = match[1];
	const op = match[2] as string | undefined; // optional capture group
	const rawValue = match[3] as string | undefined; // optional capture group
	const value = typeof rawValue === "string" ? stripslashes(rawValue) : rawValue;
	return {
		kind: "attribute",
		key,
		op,
		value,
		match(node) {
			const attrs = node.getAttribute(key, true);
			return attrs.some((cur: Attribute) => {
				switch (op) {
					case undefined:
						return true; /* attribute exists */
					case "=":
						/* eslint-disable-next-line sonarjs/different-types-comparison -- false positive */
						return cur.value === value;
					default:
						throw new Error(`Attribute selector operator ${op} is not implemented yet`);
				}
			});
		},
	};
}

/**
 * @internal
 */
export function createPseudoClassCondition(
	pseudoclass: string,
	context: string,
): PseudoClassCondition {
	const match = /^([^(]+)(?:\((.*)\))?$/.exec(pseudoclass);
	if (!match) {
		throw new Error(`Missing pseudo-class after colon in selector pattern "${context}"`);
	}
	const name = match[1];
	const args = match[2] as string | undefined; // optional capture group
	return {
		kind: "pseudo",
		name,
		args,
		match(node, selectorContext) {
			const fn = pseudoClassFunction(name, selectorContext);
			return fn(node, args);
		},
	};
}
