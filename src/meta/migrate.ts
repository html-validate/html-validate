import {
	type FormAssociated,
	type InternalAttributeFlags,
	type MetaAttribute,
	type MetaData,
	type MetaElement,
	type TextContent,
} from "./element";
import { type HtmlElementLike } from "./html-element-like";
import { type MetaAria } from "./meta-aria";

function isSet(value?: unknown): boolean {
	return typeof value !== "undefined";
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
	if (typeof attr === "undefined") {
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
	} else {
		return stripUndefined({ ...result, ...attr });
	}
}

function migrateAttributes(src: MetaData): Record<string, MetaAttribute & InternalAttributeFlags> {
	const keys = [
		...Object.keys(src.attributes ?? {}),
		...(src.requiredAttributes ?? []),
		...(src.deprecatedAttributes ?? []),
		/* eslint-disable-next-line sonarjs/no-alphabetical-sort -- not really needed in this case, this is a-z anyway */
	].sort();

	const entries: Array<[string, MetaAttribute & InternalAttributeFlags]> = keys.map((key) => {
		return [key, migrateSingleAttribute(src, key)];
	});

	return Object.fromEntries(entries);
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
	/* eslint-disable-next-line @typescript-eslint/no-deprecated -- should handle deprecated property for now */
	const implicitRole = normalizeAriaImplicitRole(src.implicitRole ?? src.aria?.implicitRole);
	const result = {
		...src,
		...{
			formAssociated: undefined as FormAssociated | undefined,
		},
		attributes: migrateAttributes(src),
		textContent: src.textContent as TextContent | undefined,
		focusable: src.focusable ?? false,
		implicitRole,
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
