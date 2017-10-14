import { Permitted, PermittedEntry, PermittedGroup } from './element';
import { DOMNode } from '../dom';

const allowedKeys = [
	'exclude',
];

export class Validator {
	public static validatePermitted(node: DOMNode, rules: Permitted): boolean {
		if (!rules){
			return true;
		}
		return rules.some(rule => {
			return Validator.validatePermittedRule(node, rule);
		});
	}

	public static validateOccurrences(node: DOMNode, rules: Permitted, numSiblings: number): boolean {
		if (!rules){
			return true;
		}
		const category = rules.find(cur => {
			/** @todo handle complex rules and not just plain arrays (but as of now
			 * there is no use-case for it) */
			if (typeof cur !== 'string'){
				return false;
			}
			const match = cur.match(/^(.*?)[?*]?$/);
			return match && match[1] === node.tagName;
		});
		const limit = parseAmountQualifier(category as string);
		return limit === null || numSiblings <= limit;
	}

	private static validatePermittedRule(node: DOMNode, rule: PermittedEntry): boolean {
		if (typeof rule === 'string'){
			return Validator.validatePermittedCategory(node, rule);
		} else if (Array.isArray(rule)){
			return rule.every((inner: PermittedEntry) => {
				return Validator.validatePermittedRule(node, inner);
			});
		} else {
			validateKeys(rule);
			if (rule.exclude){
				if (Array.isArray(rule.exclude)){
					return !rule.exclude.some((inner: PermittedEntry) => {
						return Validator.validatePermittedRule(node, inner);
					});
				} else {
					return !Validator.validatePermittedRule(node, rule.exclude);
				}
			} else {
				return false;
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
	 * @param {DOMNode} node - The node to test against
	 * @param {string} category - Name of category with '@' prefix or tag name.
	 */
	private static validatePermittedCategory(node: DOMNode, category: string): boolean {
		/* match tagName when an explicit name is given */
		if (category[0] !== '@'){
			const [, tagName] = category.match(/^(.*?)[?*]?$/);
			return node.tagName === tagName;
		}

		/* if the meta entry is missing assume any content model would match */
		if (!node.meta){
			return true;
		}

		switch (category){
		case '@meta': return node.meta.metadata as boolean;
		case '@flow': return node.meta.flow as boolean;
		case '@sectioning': return node.meta.sectioning as boolean;
		case '@heading': return node.meta.heading as boolean;
		case '@phrasing': return node.meta.phrasing as boolean;
		case '@embedded': return node.meta.embedded as boolean;
		case '@interactive': return node.meta.interactive as boolean;
		default: throw new Error(`Invalid content category "${category}"`);
		}
	}
}

function validateKeys(rule: PermittedGroup): void {
	for (const key of Object.keys(rule)) {
		if (allowedKeys.indexOf(key) === -1){
			const str = JSON.stringify(rule);
			throw new Error(`Permitted rule "${str}" contains unknown property "${key}"`);
		}
	}
}

function parseAmountQualifier(category: string): number {
	if (!category){
		/* content not allowed, catched by another rule so just assume unlimited
		 * usage for this purpose */
		return null;
	}

	const [, qualifier] = category.match(/^.*?([?*]?)$/);
	switch (qualifier){
	case '?': return 1;
	case '': return null;
	case '*': return null;
	default:
		throw new Error(`Invalid amount qualifier "${qualifier}" used`);
	}
}
