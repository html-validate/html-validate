import { Rule } from '../rule';
import { HtmlElement } from '../dom';
import { DOMReadyEvent } from '../event';
import { PermittedAttribute } from '../meta/element';

const defaults = {
	style: 'omit',
};

type checkFunction = (key: string, value: string) => boolean;

class AttributeBooleanStyle extends Rule {
	hasInvalidStyle: checkFunction;

	constructor(options: object){
		super(Object.assign({}, defaults, options));
		this.hasInvalidStyle = parseStyle(this.options.style);
	}

	setup(){
		this.on('dom:ready', (event: DOMReadyEvent) => {
			const doc = event.document;
			doc.visitDepthFirst((node: HtmlElement) => {
				const meta = node.meta;

				/* ignore rule if element has no meta or meta does not specify attribute
				 * allowed values */
				if (!meta || !meta.attributes) return;

				/* check all boolean attributes */
				for (const [key, attr] of Object.entries(node.attr)){
					if (!this.isBoolean(key, meta.attributes)) continue;

					if (this.hasInvalidStyle(key, attr.value)){
						this.report(node, reportMessage(key, attr.value, this.options.style), attr.location);
					}
				}
			});
		});
	}

	isBoolean(key: string, rules: PermittedAttribute): boolean {
		return rules[key] && rules[key].length === 0;
	}
}

function parseStyle(style: string): checkFunction {
	switch (style.toLowerCase()){
	case 'omit': return (key, value) => typeof value !== 'undefined';
	case 'empty': return (key, value) => value !== '';
	case 'name': return (key, value) => value !== key;
	default:
		throw new Error(`Invalid style "${style}" for "attribute-boolean-style" rule`);
	}
}

function reportMessage(key: string, value: string, style: string): string {
	switch (style.toLowerCase()){
	case 'omit': return `Attribute "${key}" should omit value`;
	case 'empty': return `Attribute "${key}" value should be empty string`;
	case 'name': return `Attribute "${key}" should be set to ${key}="${key}"`;
	}
	/* istanbul ignore next: the above switch should cover all cases */
	return '';
}

module.exports = AttributeBooleanStyle;
