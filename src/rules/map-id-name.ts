import { type Attribute, DynamicValue } from "../dom";
import { type TagReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

function isRelevant(event: TagReadyEvent): boolean {
	return event.target.is("map");
}

function hasStaticValue(
	attr: Attribute | null,
): attr is Attribute & { readonly value: string | null } {
	return Boolean(attr && !(attr.value instanceof DynamicValue));
}

export default class MapIdName extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"When the `id` attribute is present on a `<map>` element it must be equal to the `name` attribute.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:ready", isRelevant, (event: TagReadyEvent) => {
			const { target } = event;
			const id = target.getAttribute("id");
			const name = target.getAttribute("name");

			// /* ignore missing attributes or dynamic value */
			if (!hasStaticValue(id) || !hasStaticValue(name)) {
				return;
			}

			/* ignore when id and name is the same */
			if (id.value === name.value) {
				return;
			}

			this.report({
				node: event.target,
				message: `"id" and "name" attribute must be the same on <map> elements`,
				location: id.valueLocation ?? name.valueLocation,
			});
		});
	}
}
