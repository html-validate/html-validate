import { Attribute, DynamicValue, HtmlElement, DOMTokenList } from "../dom";
import {
	Permitted,
	PermittedAttribute,
	PermittedEntry,
	PermittedGroup,
	PermittedOrder,
	RequiredAncestors,
	RequiredContent,
	MetaAttribute,
} from "./element";

const allowedKeys = ["exclude"];

/**
 * Helper class to validate elements against metadata rules.
 */
export class Validator {
	/**
	 * Test if element is used in a proper context.
	 *
	 * @param node - Element to test.
	 * @param rules - List of rules.
	 * @returns `true` if element passes all tests.
	 */
	public static validatePermitted(
		node: HtmlElement,
		rules: Permitted
	): boolean {
		if (!rules) {
			return true;
		}
		return rules.some((rule) => {
			return Validator.validatePermittedRule(node, rule);
		});
	}

	/**
	 * Test if an element is used the correct amount of times.
	 *
	 * For instance, a `<table>` element can only contain a single `<tbody>`
	 * child. If multiple `<tbody>` exists this test will fail both nodes.
	 *
	 * @param node - Element to test.
	 * @param rules - List of rules.
	 * @param numSiblings - How many siblings of the same type as the element
	 * exists (including the element itself)
	 * @returns `true` if the element passes the test.
	 */
	public static validateOccurrences(
		node: HtmlElement,
		rules: Permitted,
		numSiblings: number
	): boolean {
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
	 * For instance, for a `<table>` element the `<caption>` element must come
	 * before a `<thead>` which must come before `<tbody>`.
	 *
	 * @param children - Array of children to validate.
	 */
	public static validateOrder(
		children: HtmlElement[],
		rules: PermittedOrder,
		cb: (node: HtmlElement, prev: HtmlElement) => void
	): boolean {
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
				const orderSpecified = rules.find((cur: string) =>
					Validator.validatePermittedCategory(node, cur)
				);
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

	/**
	 * Validate element ancestors.
	 *
	 * Check if an element has the required set of elements. At least one of the
	 * selectors must match.
	 */
	public static validateAncestors(
		node: HtmlElement,
		rules: RequiredAncestors
	): boolean {
		if (!rules || rules.length === 0) {
			return true;
		}

		return rules.some((rule) => node.closest(rule));
	}

	/**
	 * Validate element required content.
	 *
	 * Check if an element has the required set of elements. At least one of the
	 * selectors must match.
	 *
	 * Returns [] when valid or a list of tagNames missing as content.
	 */
	public static validateRequiredContent(
		node: HtmlElement,
		rules: RequiredContent
	): string[] {
		if (!rules || rules.length === 0) {
			return [];
		}

		return rules.filter((tagName) => {
			const haveMatchingChild = node.childElements.some((child) =>
				child.is(tagName)
			);
			return !haveMatchingChild;
		});
	}

	/**
	 * Test if an attribute has an allowed value and/or format.
	 *
	 * @param attr - Attribute to test.
	 * @param rules - Element attribute metadta.
	 * @returns `true` if attribute passes all tests.
	 */
	/* eslint-disable-next-line complexity */
	public static validateAttribute(
		attr: Attribute,
		rules: PermittedAttribute
	): boolean {
		const rule = rules[attr.key];
		if (!rule) {
			return true;
		}

		/* consider dynamic values as valid as there is no way to properly test them
		 * while using transformed sources, i.e. it must be tested when running in a
		 * browser instead */
		const value = attr.value;
		if (value instanceof DynamicValue) {
			return true;
		}

		const empty = value === null || value === "";

		/* if boolean is set the value can be either null, empty string or the
		 * attribute key (attribute-boolean-style regulates style) */
		if (rule.boolean) {
			return empty || value === attr.key;
		}

		/* if omit is set the value can be either null or empty string
		 * (attribute-empty style regulates style) */
		if (rule.omit && empty) {
			return true;
		}

		/* validate each token when using list, all tokens must be valid */
		if (rule.list) {
			const tokens = new DOMTokenList(value);
			return tokens.every((token) => {
				return this.validateAttributeValue(token, rule);
			});
		}

		return this.validateAttributeValue(value, rule);
	}

	private static validateAttributeValue(
		value: string,
		rule: MetaAttribute
	): boolean {
		/* skip attribute if it not have enumerated list */
		if (!rule.enum) {
			return true;
		}

		if (value === null || value === undefined) {
			return false;
		}

		return rule.enum.some((entry: string | RegExp) => {
			if (entry instanceof RegExp) {
				return !!value.match(entry);
			} else {
				return value === entry;
			}
		});
	}

	private static validatePermittedRule(
		node: HtmlElement,
		rule: PermittedEntry
	): boolean {
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
	// eslint-disable-next-line complexity
	private static validatePermittedCategory(
		node: HtmlElement,
		category: string
	): boolean {
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
			case "@meta":
				return node.meta.metadata as boolean;
			case "@flow":
				return node.meta.flow as boolean;
			case "@sectioning":
				return node.meta.sectioning as boolean;
			case "@heading":
				return node.meta.heading as boolean;
			case "@phrasing":
				return node.meta.phrasing as boolean;
			case "@embedded":
				return node.meta.embedded as boolean;
			case "@interactive":
				return node.meta.interactive as boolean;
			case "@script":
				return node.meta.scriptSupporting;
			case "@form":
				return node.meta.form;
			default:
				throw new Error(`Invalid content category "${category}"`);
		}
	}
}

function validateKeys(rule: PermittedGroup): void {
	for (const key of Object.keys(rule)) {
		if (allowedKeys.indexOf(key) === -1) {
			const str = JSON.stringify(rule);
			throw new Error(
				`Permitted rule "${str}" contains unknown property "${key}"`
			);
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
		case "?":
			return 1;
		case "":
			return null;
		case "*":
			return null;
		/* istanbul ignore next */
		default:
			throw new Error(`Invalid amount qualifier "${qualifier}" used`);
	}
}
