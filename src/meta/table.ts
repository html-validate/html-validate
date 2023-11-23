import Ajv, { type ValidateFunction, type SchemaObject } from "ajv";
import ajvSchemaDraft from "ajv/lib/refs/json-schema-draft-06.json";
import deepmerge from "deepmerge";
import { type HtmlElement } from "../dom";
import { ensureError, SchemaValidationError, UserError, InheritError } from "../error";
import { type SchemaValidationPatch } from "../plugin";
import { computeHash } from "../utils/compute-hash";
import schema from "../schema/elements.json";
import { ajvFunctionKeyword, ajvRegexpKeyword } from "../schema/keywords";
import {
	type ElementTable,
	type InternalAttributeFlags,
	type MetaAttribute,
	type MetaDataTable,
	type MetaElement,
	type MetaLookupableProperty,
	type PropertyExpression,
	setMetaProperty,
} from "./element";
import { migrateElement } from "./migrate";
import { hasAttribute, isDescendant, matchAttribute } from "./evaluator";

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

const functionTable: Record<string, PropertyEvaluator> = {
	isDescendant: isDescendantFacade,
	hasAttribute: hasAttributeFacade,
	matchAttribute: matchAttributeFacade,
};

const schemaCache = new Map<number, ValidateFunction<MetaDataTable>>();

function clone<T>(src: T): T {
	return JSON.parse(JSON.stringify(src)) as T;
}

function overwriteMerge<T>(a: T[], b: T[]): T[] {
	return b;
}

/**
 * @public
 */
export class MetaTable {
	private readonly elements: ElementTable;

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
	 * @public
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
	 * @public
	 * @param obj - Object with metadata to load
	 * @param filename - Optional filename used when presenting validation error
	 */
	public loadFromObject(obj: unknown, filename: string | null = null): void {
		try {
			const validate = this.getSchemaValidator();
			if (!validate(obj)) {
				throw new SchemaValidationError(
					filename,
					`Element metadata is not valid`,
					obj,
					this.schema,
					/* istanbul ignore next: AJV sets .errors when validate returns false */
					validate.errors ?? [],
				);
			}

			for (const [key, value] of Object.entries(obj)) {
				if (key === "$schema") continue;
				this.addEntry(key, migrateElement(value));
			}
		} catch (err) {
			if (err instanceof InheritError) {
				err.filename = filename;
				throw err;
			}
			if (err instanceof SchemaValidationError) {
				throw err;
			}
			if (!filename) {
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
				throw new InheritError({
					tagName,
					inherit: name,
				});
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
		const hash = computeHash(JSON.stringify(this.schema));
		const cached = schemaCache.get(hash);
		if (cached) {
			return cached;
		} else {
			const ajv = new Ajv({ strict: true, strictTuples: true, strictTypes: true });
			ajv.addMetaSchema(ajvSchemaDraft);
			ajv.addKeyword(ajvFunctionKeyword);
			ajv.addKeyword(ajvRegexpKeyword);
			ajv.addKeyword({ keyword: "copyable" });
			const validate = ajv.compile<MetaDataTable>(this.schema);
			schemaCache.set(hash, validate);
			return validate;
		}
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
			merged.attributes as Record<string, MetaAttribute & InternalAttributeFlags>,
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
		// eslint-disable-next-line security/detect-non-literal-regexp -- expected to be regexp
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
	expr: PropertyExpression,
): [PropertyEvaluator, string | [string, string, string]] {
	if (typeof expr === "string") {
		return parseExpression([expr, {}]);
	} else {
		/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- old style expressions should be replaced with typesafe functions */
		const [funcName, options] = expr;
		const func = functionTable[funcName];
		if (!func) {
			throw new Error(`Failed to find function "${funcName}" when evaluating property expression`);
		}
		return [func, options as string | [string, string, string]];
	}
}

function isDescendantFacade(node: HtmlElement, tagName: any): boolean {
	if (typeof tagName !== "string") {
		throw new Error(
			`Property expression "isDescendant" must take string argument when evaluating metadata for <${node.tagName}>`,
		);
	}
	return isDescendant(node, tagName);
}

function hasAttributeFacade(node: HtmlElement, attr: any): boolean {
	if (typeof attr !== "string") {
		throw new Error(
			`Property expression "hasAttribute" must take string argument when evaluating metadata for <${node.tagName}>`,
		);
	}
	return hasAttribute(node, attr);
}

function matchAttributeFacade(
	node: HtmlElement,
	match: string | [string, string, string],
): boolean {
	if (!Array.isArray(match) || match.length !== 3) {
		throw new Error(
			`Property expression "matchAttribute" must take [key, op, value] array as argument when evaluating metadata for <${node.tagName}>`,
		);
	}
	const [key, op, value] = match.map((x) => x.toLowerCase());
	switch (op) {
		case "!=":
		case "=":
			return matchAttribute(node, key, op, value);
		default:
			throw new Error(
				`Property expression "matchAttribute" has invalid operator "${op}" when evaluating metadata for <${node.tagName}>`,
			);
	}
}
