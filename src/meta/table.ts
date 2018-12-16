import { HtmlElement } from '../dom';
import { MetaElement, ElementTable, PropertyExpression } from './element';
const deepmerge = require('deepmerge');

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
type PropertyEvaluator = (node: HtmlElement, options: any) => boolean;

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

	init(){
		this.resolveGlobal();
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

	/**
	 * Finds the global element definition and merges each known element with the
	 * global, e.g. to assign global attributes.
	 */
	private resolveGlobal(): void {
		/* skip if there is no global elements */
		if (!this.elements['*']) return;

		/* fetch and remove the global element, it should not be resolvable by
		 * itself */
		const global = this.elements['*'];
		delete this.elements['*'];

		/* hack: unset default properties which global should not override */
		delete global.tagName;
		delete global.void;

		/* merge elements */
		for (const [tagName, entry] of Object.entries(this.elements)){
			this.elements[tagName] = this.mergeElement(entry, global);
		}
	}

	private mergeElement(a: MetaElement, b: MetaElement): MetaElement {
		return deepmerge(a, b);
	}

	resolve(node: HtmlElement){
		if (node.meta){
			expandProperties(node, node.meta);
		}
	}
}

function expandProperties(node: HtmlElement, entry: MetaElement){
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

function evaluateProperty(node: HtmlElement, expr: PropertyExpression): boolean {
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

function isDescendant(node: HtmlElement, tagName: any): boolean {
	if (typeof tagName !== 'string'){
		throw new Error(`Property expression "isDescendant" must take string argument when evaluating metadata for <${node.tagName}>`);
	}
	let cur: HtmlElement = node.parent;
	while (!cur.isRootElement()){
		if (cur.is(tagName)){
			return true;
		}
		cur = cur.parent;
	}
	return false;
}

function hasAttribute(node: HtmlElement, attr: any): boolean {
	if (typeof attr !== 'string'){
		throw new Error(`Property expression "hasAttribute" must take string argument when evaluating metadata for <${node.tagName}>`);
	}
	return node.hasAttribute(attr);
}

function matchAttribute(node: HtmlElement, match: any): boolean {
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
