import { type Attribute, DynamicValue } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

function getName(attr: Attribute): string | null {
	const name = attr.value;
	if (!name || name instanceof DynamicValue) {
		return null;
	}

	return name;
}

export default class MapDupName extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description:
				"`<map>` must have a unique name, it cannot be the same name as another `<map>` element",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			const maps = document.querySelectorAll("map[name]");

			const names = new Set<string>();

			for (const map of maps) {
				const attr = map.getAttribute("name");
				/* istanbul ignore next -- should not happen as querySelector matches
				 * only the elements with the name attribute */
				if (!attr) {
					continue;
				}

				const name = getName(attr);
				if (!name) {
					continue;
				}

				if (names.has(name)) {
					this.report({
						node: map,
						message: `<map> name must be unique`,
						location: attr.keyLocation,
					});
				}

				names.add(name);
			}
		});
	}
}
