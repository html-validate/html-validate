import { DynamicValue } from "../../dom";
import { AttributeData } from "../../parser";

export function* processAttribute(
	attr: AttributeData
): Iterable<AttributeData> {
	/* handle foo="{{ bar }}" as "foo" with a dynamic value (interpolated) */
	if (typeof attr.value === "string" && attr.value.match(/{{.*}}/)) {
		yield Object.assign({}, attr, {
			value: new DynamicValue(attr.value),
		});
		return;
	}

	/* passthru original attribute */
	yield attr;

	/* handle "dynamic-foo" as alias for "foo" with dynamic value */
	if (attr.key.startsWith("dynamic-")) {
		yield Object.assign({}, attr, {
			key: attr.key.replace("dynamic-", ""),
			value: new DynamicValue(attr.value as string),
			originalAttribute: attr.key,
		});
	}
}
