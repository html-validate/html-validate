import { regexpEscape } from "../utils/regexp-escape";
import {
	type FormAssociated,
	type InternalAttributeFlags,
	type InternalPatternAttributeFlags,
	type MetaAttribute,
	type MetaData,
	type MetaElement,
	type NormalizedPatternAttribute,
	type TextContent,
} from "./element";
import { type HtmlElementLike } from "./html-element-like";
import { type MetaAria } from "./meta-aria";

function isSet(value?: unknown): boolean {
	return value !== undefined;
}

function flag(value?: boolean): true | undefined {
	return value ? true : undefined;
}

function stripUndefined(
	src: MetaAttribute & InternalAttributeFlags,
): MetaAttribute & InternalAttributeFlags {
	const entries = Object.entries(src).filter(([, value]) => isSet(value));
	return Object.fromEntries(entries);
}

function migrateSingleAttribute(
	src: MetaData,
	key: string,
): MetaAttribute & InternalAttributeFlags {
	const result: MetaAttribute & InternalAttributeFlags = {};

	result.deprecated = flag(src.deprecatedAttributes?.includes(key));
	result.required = flag(src.requiredAttributes?.includes(key));
	result.omit = undefined;

	const attr = src.attributes ? src.attributes[key] : undefined;
	if (attr === undefined) {
		return stripUndefined(result);
	}

	/* when the attribute is set to null we use a special property "delete" to
	 * flag it, if it is still set during merge (inheritance, overwriting, etc) the attribute will be removed */
	if (attr === null) {
		result.delete = true;
		return stripUndefined(result);
	}

	if (Array.isArray(attr)) {
		if (attr.length === 0) {
			result.boolean = true;
		} else {
			result.enum = attr.filter((it) => it !== "");
			if (attr.includes("")) {
				result.omit = true;
			}
		}
		return stripUndefined(result);
	}
	return stripUndefined({ ...result, ...attr });
}

function isPatternAttribute(key: string): boolean {
	return key.includes("*");
}

export function patternToRegex(pattern: string): RegExp {
	/* eslint-disable-next-line @typescript-eslint/no-deprecated -- should be replaced with native RegExp.escape() when available */
	const escaped = pattern.split("*").map(regexpEscape).join(".+");
	/* eslint-disable-next-line security/detect-non-literal-regexp -- while pattern is under user control the user portion has been escaped */
	return new RegExp(`^${escaped}$`, "i");
}

function migrateAttributes(src: MetaData): Record<string, MetaAttribute & InternalAttributeFlags> {
	const keys = [
		...Object.keys(src.attributes ?? {}),
		...(src.requiredAttributes ?? []),
		...(src.deprecatedAttributes ?? []),
	]
		.filter((key) => !isPatternAttribute(key))
		.toSorted((a, b) => a.localeCompare(b));

	const entries: Array<[string, MetaAttribute & InternalAttributeFlags]> = keys.map((key) => {
		return [key, migrateSingleAttribute(src, key)];
	});

	return Object.fromEntries(entries);
}

function migratePatternAttributes(
	src: MetaData,
): Array<NormalizedPatternAttribute & InternalPatternAttributeFlags> {
	const attrs = src.attributes ?? {};
	return Object.entries(attrs)
		.filter(([key]) => isPatternAttribute(key))
		.map(([pattern]): NormalizedPatternAttribute & InternalPatternAttributeFlags => {
			const { delete: deleted, ...attr } = migrateSingleAttribute(src, pattern);
			const regexp = patternToRegex(pattern);
			if (deleted) {
				return { pattern, regexp, delete: true };
			}
			return { ...attr, pattern, regexp };
		});
}

function normalizeAriaImplicitRole(
	value: MetaAria["implicitRole"],
): (node: HtmlElementLike) => string | null {
	if (!value) {
		return () => null;
	}
	if (typeof value === "string") {
		return () => value;
	}
	return value;
}

function normalizeAriaNaming(
	value: MetaAria["naming"],
): (node: HtmlElementLike) => "prohibited" | "allowed" {
	if (!value) {
		/* default value is also stored in {@link ariaNaming} */
		return () => "allowed";
	}
	if (typeof value === "string") {
		return () => value;
	}
	return value;
}

export function migrateElement(src: MetaData): Omit<MetaElement, "tagName"> {
	const implicitRole = normalizeAriaImplicitRole(src.aria?.implicitRole);
	const result = {
		...src,
		formAssociated: undefined as FormAssociated | undefined,
		attributes: migrateAttributes(src),
		patternAttributes: migratePatternAttributes(src),
		textContent: src.textContent as TextContent | undefined,
		focusable: src.focusable ?? false,
		implicitRole,
		templateRoot: src.templateRoot === true,
		aria: {
			implicitRole,
			naming: normalizeAriaNaming(src.aria?.naming),
		},
	};

	/* removed properties */
	delete result.deprecatedAttributes;
	delete result.requiredAttributes;

	/* strip out undefined */
	if (!result.textContent) {
		delete result.textContent;
	}

	if (src.formAssociated) {
		result.formAssociated = {
			disablable: Boolean(src.formAssociated.disablable),
			listed: Boolean(src.formAssociated.listed),
		};
	} else {
		delete result.formAssociated;
	}

	return result;
}
