import { MetaAttribute, MetaDataTable } from "./element";

function migrateAttributes(element: any): void {
	const {
		attributes = {},
		deprecatedAttributes = [],
		requiredAttributes = [],
	} = element;

	/* get unique keys from attributes, requiredAttributes and deprecatedAttributes */
	const keys = Array.from(
		new Set([
			...Object.keys(attributes),
			...deprecatedAttributes,
			...requiredAttributes,
		])
	);

	/* if there is none there is nothing to migrate */
	if (keys.length === 0) {
		return;
	}

	/* initialize new attribute object */
	const result: Record<string, MetaAttribute> = keys.reduce((dst, key) => {
		dst[key] = {};
		return dst;
	}, {});

	/* copy over old attribute data into new structure */
	for (const [key, attr] of Object.entries<any>(attributes)) {
		if (Array.isArray(attr)) {
			if (attr.length === 0) {
				result[key].boolean = true;
			} else {
				result[key].enum = attr;
				if (attr.includes("")) {
					result[key].omit = true;
				}
			}
		} else {
			Object.assign(result[key], attr);
		}
	}

	/* mark deprecated attributes */
	for (const key of Object.values<string>(deprecatedAttributes)) {
		result[key].deprecated = true;
	}

	/* mark required attributes */
	for (const key of Object.values<string>(requiredAttributes)) {
		result[key].required = true;
	}

	/* update new attributes and remove deprecated properties */
	element.attributes = result;
	delete element.deprecatedAttributes;
	delete element.requiredAttributes;
}

export function migrateElement(src: any): MetaDataTable {
	for (const element of Object.values<any>(src)) {
		migrateAttributes(element);
	}
	return src;
}
