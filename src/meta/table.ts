import { DOMNode } from '../dom';
import { MetaElement, ElementTable, PropertyExpression } from './element';

const allowedKeys = [
	'tagName',
	'metadata',
	'flow',
	'sectioning',
	'heading',
	'phrasing',
	'embedded',
	'interactive',
	'deprecated',
	'void',
	'transparent',
	'implicitClosed',
	'attributes',
	'deprecatedAttributes',
	'permittedContent',
	'permittedDescendants',
	'permittedOrder',
];

const dynamicKeys = [
	'metadata',
	'flow',
	'sectioning',
	'heading',
	'phrasing',
	'embedded',
	'interactive',
];

// eslint-disable-next-line no-unused-vars
type PropertyEvaluator = (node: DOMNode, options: any) => boolean;

const functionTable: { [key: string]: PropertyEvaluator } = {
	isDescendant,
	hasAttribute,
	matchAttribute,
};

export class MetaTable {
	readonly elements: ElementTable;

	constructor(){
		this.elements = {};
	}

	loadFromObject(obj: ElementTable){
		for (const key of Object.keys(obj)) {
			this.addEntry(key, obj[key]);
		}
	}

	loadFromFile(filename: string){
		this.loadFromObject(require(filename));
	}

	getMetaFor(tagName: string): MetaElement {
		/* @TODO Only entries with dynamic properties has to be copied, static
		 * entries could be shared */
		tagName = tagName.toLowerCase();
		return this.elements[tagName] ? Object.assign({}, this.elements[tagName]) : null;
	}

	private addEntry(tagName: string, entry: MetaElement): void {
		for (const key of Object.keys(entry)) {
			if (allowedKeys.indexOf(key) === -1){
				throw new Error(`Metadata for <${tagName}> contains unknown property "${key}"`);
			}
		}

		const expanded: MetaElement = Object.assign({
			tagName,
			void: false,
		}, entry);
		expandRegex(expanded);

		this.elements[tagName] = expanded;
	}

	resolve(node: DOMNode){
		if (node.meta){
			expandProperties(node, node.meta);
		}
	}
}

function expandProperties(node: DOMNode, entry: MetaElement){
	for (const key of dynamicKeys){
		const property = entry[key];
		if (property && typeof property !== 'boolean'){
			entry[key] = evaluateProperty(node, property as PropertyExpression);
		}
	}
}

function expandRegex(entry: MetaElement){
	if (!entry.attributes) return;
	for (const [name, values] of Object.entries(entry.attributes)){
		entry.attributes[name] = values.map((value: string|RegExp) => {
			const match = typeof value === 'string' && value.match(/^\/(.*)\/$/);
			if (match){
				return new RegExp(match[1]);
			} else {
				return value;
			}
		});
	}
}

function evaluateProperty(node: DOMNode, expr: PropertyExpression): boolean {
	const [func, options] = parseExpression(expr);
	return func(node, options);
}

function parseExpression(expr: PropertyExpression): [PropertyEvaluator, any] {
	if (typeof expr === 'string'){
		return parseExpression([expr, {}]);
	} else {
		const [funcName, options] = expr;
		const func = functionTable[funcName];
		if (!func){
			throw new Error(`Failed to find function "${funcName}" when evaluating property expression`);
		}
		return [func, options];
	}
}

function isDescendant(node: DOMNode, tagName: any): boolean {
	if (typeof tagName !== 'string'){
		throw new Error(`Property expression "isDescendant" must take string argument when evaluating metadata for <${node.tagName}>`);
	}
	let cur: DOMNode = node.parent;
	while (!cur.isRootElement()){
		if (cur.is(tagName)){
			return true;
		}
		cur = cur.parent;
	}
	return false;
}

function hasAttribute(node: DOMNode, attr: any): boolean {
	if (typeof attr !== 'string'){
		throw new Error(`Property expression "hasAttribute" must take string argument when evaluating metadata for <${node.tagName}>`);
	}
	return node.hasAttribute(attr);
}

function matchAttribute(node: DOMNode, match: any): boolean {
	if (!Array.isArray(match) || match.length !== 3){
		throw new Error(`Property expression "matchAttribute" must take [key, op, value] array as argument when evaluating metadata for <${node.tagName}>`);
	}
	const [key, op, value] = match.map(x => x.toLowerCase());
	const nodeValue = (node.getAttributeValue(key) || '').toLowerCase();
	switch (op){
	case '!=': return nodeValue !== value;
	case '=': return nodeValue === value;
	default: throw new Error(`Property expression "matchAttribute" has invalid operator "${op}" when evaluating metadata for <${node.tagName}>`);
	}
}
