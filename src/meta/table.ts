import Ajv from "ajv";
import betterAjvErrors from "better-ajv-errors";
import deepmerge from "deepmerge";
import jsonMergePatch from "json-merge-patch";
import { HtmlElement } from "../dom";
import { UserError } from "../error/user-error";
import { SchemaValidationPatch } from "../plugin";
import {
	ElementTable,
	MetaData,
	MetaDataTable,
	MetaElement,
	PropertyExpression,
} from "./element";
import { MetaValidationError } from "./validation-error";

const dynamicKeys = [
	"metadata",
	"flow",
	"sectioning",
	"heading",
	"phrasing",
	"embedded",
	"interactive",
];

type PropertyEvaluator = (node: HtmlElement, options: any) => boolean;

const functionTable: { [key: string]: PropertyEvaluator } = {
	isDescendant,
	hasAttribute,
	matchAttribute,
};

function clone(src: any): any {
	return JSON.parse(JSON.stringify(src));
}

export class MetaTable {
	public readonly elements: ElementTable;
	private schema: object;

	constructor() {
		this.elements = {};
		this.schema = clone(require("../../elements/schema.json"));
	}

	public init() {
		this.resolveGlobal();
	}

	/**
	 * Extend validation schema.
	 */
	public extendValidationSchema(patch: SchemaValidationPatch): void {
		if (patch.properties) {
			this.schema = jsonMergePatch.apply(this.schema, {
				patternProperties: {
					"^.*$": {
						properties: patch.properties,
					},
				},
			});
		}
		if (patch.definitions) {
			this.schema = jsonMergePatch.apply(this.schema, {
				definitions: patch.definitions,
			});
		}
	}

	/**
	 * Load metadata table from object.
	 */
	public loadFromObject(obj: MetaDataTable): void {
		const ajv = new Ajv({ jsonPointers: true });
		const validator = ajv.compile(this.schema);
		const valid = validator(obj);
		if (!valid) {
			const output = betterAjvErrors(this.schema, obj, validator.errors, {
				format: "js",
			}) as any;
			const message = output[0].error;
			throw new MetaValidationError(
				`Element metadata is not valid: ${message}`,
				obj,
				this.schema,
				validator.errors
			);
		}

		for (const key of Object.keys(obj)) {
			this.addEntry(key, obj[key]);
		}
	}

	/**
	 * Load metadata table from filename
	 */
	public loadFromFile(filename: string): void {
		let json;
		try {
			json = require(filename);
		} catch (err) {
			throw new UserError(
				`Failed to load element metadata from "${filename}"`,
				err
			);
		}
		this.loadFromObject(clone(json));
	}

	public getMetaFor(tagName: string): MetaElement {
		/* @TODO Only entries with dynamic properties has to be copied, static
		 * entries could be shared */
		tagName = tagName.toLowerCase();
		return this.elements[tagName]
			? Object.assign({}, this.elements[tagName])
			: null;
	}

	private addEntry(tagName: string, entry: MetaData): void {
		const expanded: MetaElement = Object.assign(
			{
				tagName,
				void: false,
			},
			entry
		) as MetaElement;
		expandRegex(expanded);

		this.elements[tagName] = expanded;
	}

	/**
	 * Finds the global element definition and merges each known element with the
	 * global, e.g. to assign global attributes.
	 */
	private resolveGlobal(): void {
		/* skip if there is no global elements */
		if (!this.elements["*"]) return;

		/* fetch and remove the global element, it should not be resolvable by
		 * itself */
		const global = this.elements["*"];
		delete this.elements["*"];

		/* hack: unset default properties which global should not override */
		delete global.tagName;
		delete global.void;

		/* merge elements */
		for (const [tagName, entry] of Object.entries(this.elements)) {
			this.elements[tagName] = this.mergeElement(entry, global);
		}
	}

	private mergeElement(a: MetaElement, b: MetaElement): MetaElement {
		return deepmerge(a, b);
	}

	public resolve(node: HtmlElement) {
		if (node.meta) {
			expandProperties(node, node.meta);
		}
	}
}

function expandProperties(node: HtmlElement, entry: MetaElement) {
	for (const key of dynamicKeys) {
		const property = entry[key];
		if (property && typeof property !== "boolean") {
			entry[key] = evaluateProperty(node, property as PropertyExpression);
		}
	}
}

function expandRegex(entry: MetaElement) {
	if (!entry.attributes) return;
	for (const [name, values] of Object.entries(entry.attributes)) {
		entry.attributes[name] = values.map((value: string | RegExp) => {
			const match = typeof value === "string" && value.match(/^\/(.*)\/$/);
			if (match) {
				return new RegExp(match[1]);
			} else {
				return value;
			}
		});
	}
}

function evaluateProperty(
	node: HtmlElement,
	expr: PropertyExpression
): boolean {
	const [func, options] = parseExpression(expr);
	return func(node, options);
}

function parseExpression(expr: PropertyExpression): [PropertyEvaluator, any] {
	if (typeof expr === "string") {
		return parseExpression([expr, {}]);
	} else {
		const [funcName, options] = expr;
		const func = functionTable[funcName];
		if (!func) {
			throw new Error(
				`Failed to find function "${funcName}" when evaluating property expression`
			);
		}
		return [func, options];
	}
}

function isDescendant(node: HtmlElement, tagName: any): boolean {
	if (typeof tagName !== "string") {
		throw new Error(
			`Property expression "isDescendant" must take string argument when evaluating metadata for <${
				node.tagName
			}>`
		);
	}
	let cur: HtmlElement = node.parent;
	while (!cur.isRootElement()) {
		if (cur.is(tagName)) {
			return true;
		}
		cur = cur.parent;
	}
	return false;
}

function hasAttribute(node: HtmlElement, attr: any): boolean {
	if (typeof attr !== "string") {
		throw new Error(
			`Property expression "hasAttribute" must take string argument when evaluating metadata for <${
				node.tagName
			}>`
		);
	}
	return node.hasAttribute(attr);
}

function matchAttribute(node: HtmlElement, match: any): boolean {
	if (!Array.isArray(match) || match.length !== 3) {
		throw new Error(
			`Property expression "matchAttribute" must take [key, op, value] array as argument when evaluating metadata for <${
				node.tagName
			}>`
		);
	}
	const [key, op, value] = match.map(x => x.toLowerCase());
	const nodeValue = (node.getAttributeValue(key) || "").toLowerCase();
	switch (op) {
		case "!=":
			return nodeValue !== value;
		case "=":
			return nodeValue === value;
		default:
			throw new Error(
				`Property expression "matchAttribute" has invalid operator "${op}" when evaluating metadata for <${
					node.tagName
				}>`
			);
	}
}
