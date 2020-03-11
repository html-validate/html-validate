import { MetaAttribute, MetaDataTable } from "./element";

function migrateAttributes(element: any): void {
	if (!element.attributes) {
		return;
	}

	for (const [key, attr] of Object.entries<any>(element.attributes)) {
		if (Array.isArray(attr)) {
			const metaAttribute: MetaAttribute = {};
			if (attr.length === 0) {
				metaAttribute.boolean = true;
			} else {
				metaAttribute.enum = attr;
				if (attr.includes("")) {
					metaAttribute.omit = true;
				}
			}
			element.attributes[key] = metaAttribute;
		}
	}
}

export function migrateElement(src: any): MetaDataTable {
	for (const element of Object.values<any>(src)) {
		migrateAttributes(element);
	}
	return src;
}
