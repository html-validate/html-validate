import { DynamicValue } from "../../dom";
import { AttributeData } from "../../parser";

export function processAttribute(attr: AttributeData) {
	/* handle "dynamic-foo" as alias for "foo" with dynamic value */
	if (attr.key.startsWith("dynamic-")) {
		attr.value = new DynamicValue(attr.value as string);
		attr.originalAttribute = attr.key;
		attr.key = attr.key.replace("dynamic-", "");
		return attr;
	}

	/* handle foo="{{ bar }}" as "foo" with a dynamic value (interpolated) */
	if (typeof attr.value === "string" && attr.value.match(/{{.*}}/)) {
		attr.value = new DynamicValue(attr.value);
		return attr;
	}

	/* passthru attribute */
	return attr;
}
