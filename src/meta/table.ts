import Ajv, { type SchemaObject, type ValidateFunction } from "ajv";
import ajvSchemaDraft from "ajv/lib/refs/json-schema-draft-06.json";
import deepmerge from "deepmerge";
import { type HtmlElement } from "../dom";
import { InheritError, SchemaValidationError, UserError, ensureError } from "../error";
import { type SchemaValidationPatch } from "../plugin";
import schema from "../schema/elements.json";
import { ajvFunctionKeyword, ajvRegexpKeyword } from "../schema/keywords";
import { computeHash } from "../utils/compute-hash";
import {
	type InternalAttributeFlags,
	type MetaAttribute,
	type MetaDataTable,
	type MetaElement,
	type MetaLookupableProperty,
	setMetaProperty,
} from "./element";
import { migrateElement } from "./migrate";

const dynamicKeys = [
	"metadata",
	"flow",
	"sectioning",
	"heading",
	"phrasing",
	"embedded",
	"interactive",
	"labelable",
] satisfies Array<keyof MetaElement>;

const schemaCache = new Map<number, ValidateFunction<MetaDataTable>>();

function clone<T>(src: T): T {
	return JSON.parse(JSON.stringify(src)) as T;
}

function overwriteMerge<T>(_a: T[], b: T[]): T[] {
	return b;
}

/**
 * @public
 */
export class MetaTable {
	private readonly elements: Record<string, MetaElement | undefined>;

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
				if (key === "$schema") {
					continue;
				}
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
		const meta = this.elements[tagName.toLowerCase()] ?? this.elements["*"];
		if (meta) {
			return { ...meta };
		} else {
			return null;
		}
	}

	/**
	 * Find all tags which has enabled given property.
	 *
	 * @public
	 */
	public getTagsWithProperty(propName: MetaLookupableProperty): string[] {
		return this.entries.filter(([, entry]) => entry[propName]).map(([tagName]) => tagName);
	}

	/**
	 * Find tag matching tagName or inheriting from it.
	 *
	 * @public
	 */
	public getTagsDerivedFrom(tagName: string): string[] {
		return this.entries
			.filter(([key, entry]) => key === tagName || entry.inherit === tagName)
			.map(([tagName]) => tagName);
	}

	private addEntry(tagName: string, entry: Omit<MetaElement, "tagName">): void {
		let parent = this.elements[tagName];

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
		const expanded = this.mergeElement(parent ?? {}, { ...entry, tagName });
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
	 * @internal
	 */
	private get entries(): Array<[string, MetaElement]> {
		return Object.entries(this.elements) as Array<[string, MetaElement]>;
	}

	/**
	 * Finds the global element definition and merges each known element with the
	 * global, e.g. to assign global attributes.
	 */
	private resolveGlobal(): void {
		/* skip if there is no global elements */
		if (!this.elements["*"]) {
			return;
		}

		/* fetch and remove the global element, it should not be resolvable by
		 * itself */
		const global: Partial<MetaElement> = this.elements["*"];
		delete this.elements["*"];

		/* hack: unset default properties which global should not override */
		delete global.tagName;
		delete global.void;

		/* merge elements */
		for (const [tagName, entry] of this.entries) {
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
		if (typeof property === "function") {
			setMetaProperty(entry, key, property(node._adapter));
		}
	}
	if (typeof entry.focusable === "function") {
		setMetaProperty(entry, "focusable", entry.focusable(node._adapter));
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
	/* match anything starting and ending with `/`, optionally with `/i` at the end. */
	const match = /^\/(.*(?=\/))\/(i?)$/.exec(value);
	if (match) {
		const [, expr, flags] = match;
		/* eslint-disable security/detect-non-literal-regexp -- expected to be regexp */
		if (expr.startsWith("^") || expr.endsWith("$")) {
			return new RegExp(expr, flags);
		} else {
			return new RegExp(`^${expr}$`, flags);
		}
		/* eslint-enable security/detect-non-literal-regexp */
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
