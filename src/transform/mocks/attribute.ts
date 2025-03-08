import { DynamicValue } from "../../dom";
import { type AttributeData } from "../../parser";

export function* processAttribute(attr: AttributeData): Iterable<AttributeData> {
	/* handle foo="{{ bar }}" as "foo" with a dynamic value (interpolated) */
	if (typeof attr.value === "string" && /{{.*}}/.exec(attr.value)) {
		yield {
			...attr,
			value: new DynamicValue(attr.value),
		};
		return;
	}

	/* passthru original attribute */
	yield attr;

	/* handle "dynamic-foo" as alias for "foo" with dynamic value */
	if (attr.key.startsWith("dynamic-")) {
		yield {
			...attr,
			key: attr.key.replace("dynamic-", ""),
			value: new DynamicValue(attr.value as string),
			originalAttribute: attr.key,
		};
	}
}
