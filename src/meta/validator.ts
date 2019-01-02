import { HtmlElement } from "../dom";
import {
	Permitted,
	PermittedAttribute,
	PermittedEntry,
	PermittedGroup,
	PermittedOrder,
} from "./element";

const allowedKeys = [
	"exclude",
];

export class Validator {
	public static validatePermitted(node: HtmlElement, rules: Permitted): boolean {
		if (!rules) {
			return true;
		}
		return rules.some((rule) => {
			return Validator.validatePermittedRule(node, rule);
		});
	}

	public static validateOccurrences(node: HtmlElement, rules: Permitted, numSiblings: number): boolean {
		if (!rules) {
			return true;
		}
		const category = rules.find((cur) => {
			/** @todo handle complex rules and not just plain arrays (but as of now
			 * there is no use-case for it) */
			// istanbul ignore next
			if (typeof cur !== "string") {
				return false;
			}
			const match = cur.match(/^(.*?)[?*]?$/);
			return match && match[1] === node.tagName;
		});
		const limit = parseAmountQualifier(category as string);
		return limit === null || numSiblings <= limit;
	}

	/**
	 * Validate elements order.
	 *
	 * Given a parent element with children and metadata containing permitted
	 * order it will validate each children and ensure each one exists in the
	 * specified order.
	 *
	 * For instance, for a <table> element the <caption> element must come before
	 * a <thead> which must come before <tbody>.
	 *
	 * @param {HtmlElement[]} children - Array of children to validate.
	 */
	public static validateOrder(children: HtmlElement[], rules: PermittedOrder, cb: (node: HtmlElement, prev: HtmlElement) => void): boolean {
		if (!rules) {
			return true;
		}
		let i = 0;
		let prev = null;
		for (const node of children) {

			const old = i;
			while (rules[i] && !Validator.validatePermittedCategory(node, rules[i])) {
				i++;
			}

			if (i >= rules.length) {
				/* Second check is if the order is specified for this element at all. It
				 * will be unspecified in two cases:
				 * - disallowed elements
				 * - elements where the order doesn't matter
				 * In both of these cases no error should be reported. */
				const orderSpecified = rules.find((cur: string) => Validator.validatePermittedCategory(node, cur));
				if (orderSpecified) {
					cb(node, prev);
					return false;
				}

				/* if this element has unspecified order the index is restored so new
				 * elements of the same type can be specified again */
				i = old;
			}
			prev = node;
		}
		return true;
	}

	public static validateAttribute(key: string, value: string|undefined, rules: PermittedAttribute): boolean {
		const rule = rules[key];
		if (!rule) {
			return true;
		}

		/* consider an empty array as being a boolean attribute */
		if (rule.length === 0) {
			return value === undefined || value === "" || value === key;
		}

		return rule.some((entry: string|RegExp) => {
			if (entry instanceof RegExp) {
				return !!value.match(entry);
			} else {
				return value === entry;
			}
		});
	}

	private static validatePermittedRule(node: HtmlElement, rule: PermittedEntry): boolean {
		if (typeof rule === "string") {
			return Validator.validatePermittedCategory(node, rule);
		} else if (Array.isArray(rule)) {
			return rule.every((inner: PermittedEntry) => {
				return Validator.validatePermittedRule(node, inner);
			});
		} else {
			validateKeys(rule);
			if (rule.exclude) {
				if (Array.isArray(rule.exclude)) {
					return !rule.exclude.some((inner: PermittedEntry) => {
						return Validator.validatePermittedRule(node, inner);
					});
				} else {
					return !Validator.validatePermittedRule(node, rule.exclude);
				}
			} else {
				return true;
			}
		}
	}

	/**
	 * Validate node against a content category.
	 *
	 * When matching parent nodes against permitted parents use the superset
	 * parameter to also match for @flow. E.g. if a node expects a @phrasing
	 * parent it should also allow @flow parent since @phrasing is a subset of
	 * @flow.
	 *
	 * @param {HtmlElement} node - The node to test against
	 * @param {string} category - Name of category with '@' prefix or tag name.
	 */
	private static validatePermittedCategory(node: HtmlElement, category: string): boolean {
		/* match tagName when an explicit name is given */
		if (category[0] !== "@") {
			const [, tagName] = category.match(/^(.*?)[?*]?$/);
			return node.tagName === tagName;
		}

		/* if the meta entry is missing assume any content model would match */
		if (!node.meta) {
			return true;
		}

		switch (category) {
			case "@meta": return node.meta.metadata as boolean;
			case "@flow": return node.meta.flow as boolean;
			case "@sectioning": return node.meta.sectioning as boolean;
			case "@heading": return node.meta.heading as boolean;
			case "@phrasing": return node.meta.phrasing as boolean;
			case "@embedded": return node.meta.embedded as boolean;
			case "@interactive": return node.meta.interactive as boolean;
			default: throw new Error(`Invalid content category "${category}"`);
		}
	}
}

function validateKeys(rule: PermittedGroup): void {
	for (const key of Object.keys(rule)) {
		if (allowedKeys.indexOf(key) === -1) {
			const str = JSON.stringify(rule);
			throw new Error(`Permitted rule "${str}" contains unknown property "${key}"`);
		}
	}
}

function parseAmountQualifier(category: string): number {
	if (!category) {
		/* content not allowed, catched by another rule so just assume unlimited
		 * usage for this purpose */
		return null;
	}

	const [, qualifier] = category.match(/^.*?([?*]?)$/);
	switch (qualifier) {
		case "?": return 1;
		case "": return null;
		case "*": return null;
			/* istanbul ignore next */
		default:
			throw new Error(`Invalid amount qualifier "${qualifier}" used`);
	}
}
