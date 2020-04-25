import Ajv from "ajv";
import deepmerge from "deepmerge";
import jsonMergePatch from "json-merge-patch";
import { HtmlElement } from "../dom";
import { SchemaValidationError, UserError } from "../error";
import { SchemaValidationPatch } from "../plugin";
import schema from "../schema/elements.json";
import {
	ElementTable,
	MetaData,
	MetaDataTable,
	MetaElement,
	MetaLookupableProperty,
	PropertyExpression,
} from "./element";

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

function overwriteMerge<T>(a: T[], b: T[]): T[] {
	return b;
}

/**
 * AJV keyword "regexp" to validate the type to be a regular expression.
 * Injects errors with the "type" keyword to give the same output.
 */
/* istanbul ignore next: manual testing */
const ajvRegexpValidate: Ajv.ValidateFunction = function (
	data: any,
	dataPath: string
): boolean {
	const valid = data instanceof RegExp;
	if (!valid) {
		ajvRegexpValidate.errors = [
			{
				dataPath,
				schemaPath: undefined,
				keyword: "type",
				message: "should be regexp",
				params: {
					keyword: "type",
				},
			},
		];
	}
	return valid;
};
const ajvRegexpKeyword: Ajv.KeywordDefinition = {
	schema: false,
	errors: true,
	validate: ajvRegexpValidate,
};

export class MetaTable {
	public readonly elements: ElementTable;
	private schema: object;

	public constructor() {
		this.elements = {};
		this.schema = clone(schema);
	}

	public init(): void {
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
	 *
	 * @param obj - Object with metadata to load
	 * @param filename - Optional filename used when presenting validation error
	 */
	public loadFromObject(
		obj: MetaDataTable,
		filename: string | null = null
	): void {
		const ajv = new Ajv({ jsonPointers: true });
		ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-06.json"));
		ajv.addKeyword("regexp", ajvRegexpKeyword);
		const validator = ajv.compile(this.schema);
		const valid = validator(obj);
		if (!valid) {
			throw new SchemaValidationError(
				filename,
				`Element metadata is not valid`,
				obj,
				this.schema,
				validator.errors
			);
		}

		for (const key of Object.keys(obj)) {
			if (key === "$schema") continue;
			this.addEntry(key, obj[key]);
		}
	}

	/**
	 * Load metadata table from filename
	 *
	 * @param filename - Filename to load
	 */
	public loadFromFile(filename: string): void {
		try {
			/* remove cached copy so we always load a fresh copy, important for
			 * editors which keep a long-running instance of [[HtmlValidate]]
			 * around. */
			delete require.cache[require.resolve(filename)];

			/* load using require as it can process both js and json */
			const data = require(filename); // eslint-disable-line import/no-dynamic-require
			this.loadFromObject(data, filename);
		} catch (err) {
			if (err instanceof SchemaValidationError) {
				throw err;
			}
			throw new UserError(
				`Failed to load element metadata from "${filename}"`,
				err
			);
		}
	}

	/**
	 * Get [[MetaElement]] for the given tag or null if the element doesn't exist.
	 *
	 * @returns A shallow copy of metadata.
	 */
	public getMetaFor(tagName: string): MetaElement | null {
		tagName = tagName.toLowerCase();
		return this.elements[tagName]
			? Object.assign({}, this.elements[tagName])
			: null;
	}

	/**
	 * Find all tags which has enabled given property.
	 */
	public getTagsWithProperty(propName: MetaLookupableProperty): string[] {
		return Object.entries(this.elements)
			.filter(([, entry]) => entry[propName])
			.map(([tagName]) => tagName);
	}

	/**
	 * Find tag matching tagName or inheriting from it.
	 */
	public getTagsDerivedFrom(tagName: string): string[] {
		return Object.entries(this.elements)
			.filter(([key, entry]) => key === tagName || entry.inherit === tagName)
			.map(([tagName]) => tagName);
	}

	private addEntry(tagName: string, entry: MetaData): void {
		let parent = this.elements[tagName] || {};

		/* handle inheritance */
		if (entry.inherit) {
			const name = entry.inherit;
			parent = this.elements[name];
			if (!parent) {
				throw new UserError(
					`Element <${tagName}> cannot inherit from <${name}>: no such element`
				);
			}
		}

		/* merge all sources together */
		const expanded: MetaElement = deepmerge(
			parent,
			{ ...entry, tagName },
			{ arrayMerge: overwriteMerge }
		);
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

	public resolve(node: HtmlElement): void {
		if (node.meta) {
			expandProperties(node, node.meta);
		}
	}
}

function expandProperties(node: HtmlElement, entry: MetaElement): void {
	for (const key of dynamicKeys) {
		const property = entry[key];
		if (property && typeof property !== "boolean") {
			entry[key] = evaluateProperty(node, property as PropertyExpression);
		}
	}
}

/**
 * Given a string it returns either the string as-is or if the string is wrapped
 * in /../ it creates and returns a regex instead.
 */
function expandRegexValue(value: string | RegExp): string | RegExp {
	if (value instanceof RegExp) {
		return value;
	}
	const match = value.match(/^\/(.*)\/([i]*)$/);
	if (match) {
		const [, expr, flags] = match;
		// eslint-disable-next-line security/detect-non-literal-regexp
		return new RegExp(expr, flags);
	} else {
		return value;
	}
}

/**
 * Expand all regular expressions in strings ("/../"). This mutates the object.
 */
function expandRegex(entry: MetaElement): void {
	if (!entry.attributes) return;
	for (const [name, values] of Object.entries(entry.attributes)) {
		if (values) {
			entry.attributes[name] = values.map(expandRegexValue);
		} else {
			delete entry.attributes[name];
		}
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
			`Property expression "isDescendant" must take string argument when evaluating metadata for <${node.tagName}>`
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
			`Property expression "hasAttribute" must take string argument when evaluating metadata for <${node.tagName}>`
		);
	}
	return node.hasAttribute(attr);
}

function matchAttribute(node: HtmlElement, match: any): boolean {
	if (!Array.isArray(match) || match.length !== 3) {
		throw new Error(
			`Property expression "matchAttribute" must take [key, op, value] array as argument when evaluating metadata for <${node.tagName}>`
		);
	}
	const [key, op, value] = match.map((x) => x.toLowerCase());
	const nodeValue = (node.getAttributeValue(key) || "").toLowerCase();
	switch (op) {
		case "!=":
			return nodeValue !== value;
		case "=":
			return nodeValue === value;
		default:
			throw new Error(
				`Property expression "matchAttribute" has invalid operator "${op}" when evaluating metadata for <${node.tagName}>`
			);
	}
}
