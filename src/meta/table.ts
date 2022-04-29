import Ajv, { KeywordDefinition, ValidateFunction } from "ajv";
import ajvSchemaDraft from "ajv/lib/refs/json-schema-draft-06.json";
import { DataValidateFunction, DataValidationCxt, SchemaObject } from "ajv/dist/types";
import deepmerge from "deepmerge";
import { HtmlElement } from "../dom";
import { ensureError, SchemaValidationError, UserError } from "../error";
import { SchemaValidationPatch } from "../plugin";
import { requireUncached } from "../utils/require-uncached";
import schema from "../schema/elements.json";
import {
	ElementTable,
	InternalAttributeFlags,
	MetaAttribute,
	MetaDataTable,
	MetaElement,
	MetaLookupableProperty,
	PropertyExpression,
	setMetaProperty,
} from "./element";
import { migrateElement } from "./migrate";

const dynamicKeys: Array<keyof MetaElement> = [
	"metadata",
	"flow",
	"sectioning",
	"heading",
	"phrasing",
	"embedded",
	"interactive",
	"labelable",
];

type PropertyEvaluator = (node: HtmlElement, options: string | [string, string, string]) => boolean;

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
const ajvRegexpValidate: DataValidateFunction = function (
	data: any,
	dataCxt?: DataValidationCxt
): boolean {
	const valid = data instanceof RegExp;
	if (!valid) {
		ajvRegexpValidate.errors = [
			{
				instancePath: dataCxt?.instancePath,
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
const ajvRegexpKeyword: KeywordDefinition = {
	keyword: "regexp",
	schema: false,
	errors: true,
	validate: ajvRegexpValidate,
};

/**
 * @public
 */
export class MetaTable {
	public readonly elements: ElementTable;

	private schema: SchemaObject;

	/**
	 * @internal
	 */
	public constructor() {
		this.elements = {};
		this.schema = clone(schema);
	}

	/**
	 * @internal
	 */
	public init(): void {
		this.resolveGlobal();
	}

	/**
	 * Extend validation schema.
	 *
	 * @internal
	 */
	public extendValidationSchema(patch: SchemaValidationPatch): void {
		if (patch.properties) {
			this.schema = deepmerge(this.schema, {
				patternProperties: {
					"^[^$].*$": {
						properties: patch.properties,
					},
				},
			});
		}
		if (patch.definitions) {
			this.schema = deepmerge(this.schema, {
				definitions: patch.definitions,
			});
		}
	}

	/**
	 * Load metadata table from object.
	 *
	 * @internal
	 * @param obj - Object with metadata to load
	 * @param filename - Optional filename used when presenting validation error
	 */
	public loadFromObject(obj: unknown, filename: string | null = null): void {
		const validate = this.getSchemaValidator();
		if (!validate(obj)) {
			throw new SchemaValidationError(
				filename,
				`Element metadata is not valid`,
				obj,
				this.schema,
				/* istanbul ignore next: AJV sets .errors when validate returns false */
				validate.errors ?? []
			);
		}

		for (const [key, value] of Object.entries(obj)) {
			if (key === "$schema") continue;
			this.addEntry(key, migrateElement(value));
		}
	}

	/**
	 * Load metadata table from filename
	 *
	 * @internal
	 * @param filename - Filename to load
	 */
	public loadFromFile(filename: string): void {
		try {
			/* load using require as it can process both js and json */
			const data = requireUncached(filename);
			this.loadFromObject(data, filename);
		} catch (err: unknown) {
			if (err instanceof SchemaValidationError) {
				throw err;
			}
			throw new UserError(`Failed to load element metadata from "${filename}"`, ensureError(err));
		}
	}

	/**
	 * Get [[MetaElement]] for the given tag. If no specific metadata is present
	 * the global metadata is returned or null if no global is present.
	 *
	 * @public
	 * @returns A shallow copy of metadata.
	 */
	public getMetaFor(tagName: string): MetaElement | null {
		/* try to locate by tagname */
		tagName = tagName.toLowerCase();
		if (this.elements[tagName]) {
			return { ...this.elements[tagName] };
		}
		/* try to locate global element */
		if (this.elements["*"]) {
			return { ...this.elements["*"] };
		}
		return null;
	}

	/**
	 * Find all tags which has enabled given property.
	 *
	 * @public
	 */
	public getTagsWithProperty(propName: MetaLookupableProperty): string[] {
		return Object.entries(this.elements)
			.filter(([, entry]) => entry[propName])
			.map(([tagName]) => tagName);
	}

	/**
	 * Find tag matching tagName or inheriting from it.
	 *
	 * @public
	 */
	public getTagsDerivedFrom(tagName: string): string[] {
		return Object.entries(this.elements)
			.filter(([key, entry]) => key === tagName || entry.inherit === tagName)
			.map(([tagName]) => tagName);
	}

	private addEntry(tagName: string, entry: Omit<MetaElement, "tagName">): void {
		let parent = this.elements[tagName] || {};

		/* handle inheritance */
		if (entry.inherit) {
			const name = entry.inherit;
			parent = this.elements[name];
			if (!parent) {
				throw new UserError(`Element <${tagName}> cannot inherit from <${name}>: no such element`);
			}
		}

		/* merge all sources together */
		const expanded = this.mergeElement(parent, { ...entry, tagName });
		expandRegex(expanded);

		this.elements[tagName] = expanded;
	}

	/**
	 * Construct a new AJV schema validator.
	 */
	private getSchemaValidator(): ValidateFunction<MetaDataTable> {
		const ajv = new Ajv({ strict: true, strictTuples: true, strictTypes: true });
		ajv.addMetaSchema(ajvSchemaDraft);
		ajv.addKeyword(ajvRegexpKeyword);
		ajv.addKeyword({ keyword: "copyable" });
		return ajv.compile<MetaDataTable>(this.schema);
	}

	/**
	 * @public
	 */
	public getJSONSchema(): SchemaObject {
		return this.schema;
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
		const global: Partial<MetaElement> = this.elements["*"];
		delete this.elements["*"];

		/* hack: unset default properties which global should not override */
		delete global.tagName;
		delete global.void;

		/* merge elements */
		for (const [tagName, entry] of Object.entries(this.elements)) {
			this.elements[tagName] = this.mergeElement(global, entry);
		}
	}

	private mergeElement(a: Partial<MetaElement>, b: MetaElement): MetaElement {
		const merged = deepmerge(a, b, { arrayMerge: overwriteMerge });

		/* special handling when removing attributes by setting them to null
		 * resulting in the deletion flag being set */
		const filteredAttrs = Object.entries(
			merged.attributes as Record<string, MetaAttribute & InternalAttributeFlags>
		).filter(([, attr]) => {
			const val = !attr.delete;
			delete attr.delete;
			return val;
		});
		merged.attributes = Object.fromEntries(filteredAttrs);

		return merged;
	}

	/**
	 * @internal
	 */
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
			setMetaProperty(entry, key, evaluateProperty(node, property as PropertyExpression));
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
	const match = value.match(/^\/\^?([^/$]*)\$?\/([i]*)$/);
	if (match) {
		const [, expr, flags] = match;
		// eslint-disable-next-line security/detect-non-literal-regexp
		return new RegExp(`^${expr}$`, flags);
	} else {
		return value;
	}
}

/**
 * Expand all regular expressions in strings ("/../"). This mutates the object.
 */
function expandRegex(entry: MetaElement): void {
	for (const [name, values] of Object.entries(entry.attributes)) {
		if (values.enum) {
			entry.attributes[name].enum = values.enum.map(expandRegexValue);
		}
	}
}

function evaluateProperty(node: HtmlElement, expr: PropertyExpression): boolean {
	const [func, options] = parseExpression(expr);
	return func(node, options);
}

function parseExpression(
	expr: PropertyExpression
): [PropertyEvaluator, string | [string, string, string]] {
	if (typeof expr === "string") {
		return parseExpression([expr, {}]);
	} else {
		const [funcName, options] = expr;
		const func = functionTable[funcName];
		if (!func) {
			throw new Error(`Failed to find function "${funcName}" when evaluating property expression`);
		}
		return [func, options as string | [string, string, string]];
	}
}

function isDescendant(node: HtmlElement, tagName: any): boolean {
	if (typeof tagName !== "string") {
		throw new Error(
			`Property expression "isDescendant" must take string argument when evaluating metadata for <${node.tagName}>`
		);
	}
	let cur: HtmlElement | null = node.parent;
	while (cur && !cur.isRootElement()) {
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

function matchAttribute(node: HtmlElement, match: string | [string, string, string]): boolean {
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
