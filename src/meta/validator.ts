import { Permitted, PermittedEntry } from './element';
import { DOMNode } from '../dom';

export class Validator {
	static validatePermitted(node: DOMNode, rules: Permitted): boolean {
		if (!rules){
			return true;
		}
		return rules.some(rule => {
			return Validator.validatePermittedRule(node, rule);
		});
	}

	private static validatePermittedRule(node: DOMNode, rule: PermittedEntry): boolean {
		if (typeof rule === 'string'){
			return Validator.validatePermittedCategory(node, rule);
		} else if (Array.isArray(rule)){
			return rule.every(inner => {
				return Validator.validatePermittedRule(node, inner);
			});
		} else {
			return false;
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
			return node.tagName === category;
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
