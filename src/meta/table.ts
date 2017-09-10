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
		return this.elements[tagName] ? this.elements[tagName] : null;
	}

	private addEntry(tagName: string, entry: MetaElement): void {
		for (const key of Object.keys(entry)) {
			if (allowedKeys.indexOf(key) === -1){
				throw new Error(`Metadata for <${tagName}> contains unknown property "${key}"`);
			}
		}

		this.elements[tagName] = Object.assign({
			tagName,
			void: false,
		}, entry);
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
			entry[key] = evaluateProperty(node, property);
		}
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
			throw new Error(`Failed to find function when evaluation property expression "${expr}"`);
		}
		return [func, options];
	}
}

function isDescendant(node: DOMNode, tagName: any): boolean {
	if (typeof tagName !== 'string'){
		throw new Error(`Property expression "isDescendant" must take string argument`);
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
		throw new Error(`Property expression "hasAttribute" must take string argument`);
	}
	return node.hasAttribute(attr);
}

function matchAttribute(node: DOMNode, match: any): boolean {
	if (!Array.isArray(match) || match.length !== 3){
		throw new Error(`Property expression "matchAttribute" must take [key, op, value] array as argument`);
	}
	const [key, op, value] = match.map(x => x.toLowerCase());
	const nodeValue = (node.getAttribute(key) || '').toLowerCase();
	switch (op){
	case '!=': return nodeValue !== value;
	case '=': return nodeValue === value;
	default: throw new Error(`Property expression "matchAttribute" has invalid operator "${op}"`);
	}
}
