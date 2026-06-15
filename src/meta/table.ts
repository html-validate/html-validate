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
	type InternalPatternAttributeFlags,
	type MetaAttribute,
	type MetaAttributeNamedRegex,
	type MetaDataTable,
	type MetaElement,
	type MetaLookupableProperty,
	type NormalizedPatternAttribute,
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
	"submitButton",
] satisfies Array<keyof MetaElement>;

const schemaCache = new Map<number, ValidateFunction<MetaDataTable>>();

function clone<T>(value: T): T {
	/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- jsdom (e.g. jest) does not have this function */
	if (globalThis.structuredClone) {
		return globalThis.structuredClone(value);
	} else {
		/* eslint-disable-next-line unicorn/prefer-structured-clone -- structuredClone is used if present, this is only the fallback */
		return JSON.parse(JSON.stringify(value)) as T;
	}
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
		const merged: MetaElement = { ...a, ...b };

		/* merge attributes from both sources, with b taking precedence entirely */
		const mergedAttrs: Record<string, MetaAttribute & InternalAttributeFlags> = {
			...(a.attributes as Record<string, MetaAttribute & InternalAttributeFlags>),
			...(b.attributes as Record<string, MetaAttribute & InternalAttributeFlags>),
		};

		/* special handling when removing attributes by setting them to null
		 * resulting in the deletion flag being set */
		for (const [name, attr] of Object.entries(mergedAttrs)) {
			if (attr.delete) {
				/* eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- technically user data but the attribute must have been added by the user already */
				delete mergedAttrs[name];
			} else {
				delete attr.delete;
			}
		}
		merged.attributes = mergedAttrs;

		/* merge pattern attributes: b takes priority; deduplicate by pattern key; remove deleted entries */
		type PatternAttrWithFlags = NormalizedPatternAttribute & InternalPatternAttributeFlags;
		const mergedPatterns: PatternAttrWithFlags[] = [
			...(b.patternAttributes as PatternAttrWithFlags[]),
			...((a.patternAttributes ?? []) as PatternAttrWithFlags[]),
		];
		const seenPatterns = new Set<string>();
		merged.patternAttributes = mergedPatterns.filter((entry) => {
			/* note: patterns from b comes first in the array */
			if (seenPatterns.has(entry.pattern)) {
				return false;
			}
			seenPatterns.add(entry.pattern);
			return !entry.delete;
		});

		/* merge aria (shallow merge suffices as all properties are scalar or function) */
		if (a.aria) {
			merged.aria = { ...a.aria, ...b.aria };
		}

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
 * Compile a string regex literal (e.g. `"/\d+/"` or `"/^foo$/i"`) into a
 * `RegExp`. Returns `null` if the string is not a regex literal.
 */
function compileRegexString(value: string): RegExp | null {
	/* match anything starting and ending with `/`, optionally with `/i` at the end. */
	const match = /^\/(.*)\/(i?)$/.exec(value);
	if (match) {
		const [, expr, flags] = match;
		/* eslint-disable security/detect-non-literal-regexp -- expected to be regexp */
		if (expr.startsWith("^") || expr.endsWith("$")) {
			return new RegExp(expr, flags);
		} else {
			return new RegExp(`^${expr}$`, flags);
		}
		/* eslint-enable security/detect-non-literal-regexp */
	}
	return null;
}

/**
 * Normalise a single `enum` entry to either a plain keyword string or a
 * {@link MetaAttributeNamedRegex} object with a compiled `pattern`.
 *
 * - Plain keyword strings are returned as-is.
 * - String regex literals (`"/\d+/"`) are compiled and wrapped with their
 *   `toString()` representation as the `name`.
 * - Bare `RegExp` instances are wrapped with their `toString()` as the `name`.
 * - Existing {@link MetaAttributeNamedRegex} objects have their `pattern`
 *   compiled if it is still a string.
 */
function expandRegexValue(
	value: string | RegExp | MetaAttributeNamedRegex,
): string | MetaAttributeNamedRegex {
	if (value instanceof RegExp) {
		return { name: value.toString(), pattern: value };
	}
	if (typeof value === "object") {
		/* already a named regex object — compile the pattern string if needed */
		if (value.pattern instanceof RegExp) {
			return { name: value.name, pattern: value.pattern };
		}
		const compiled = compileRegexString(value.pattern);
		if (!compiled) {
			throw new Error(`Failed to create regular expression from "${value.pattern}"`);
		}
		return { name: value.name, pattern: compiled };
	}
	/* plain string: check if it is a regex literal */
	const regex = compileRegexString(value);
	if (regex) {
		return { name: regex.toString(), pattern: regex };
	}
	return value;
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
