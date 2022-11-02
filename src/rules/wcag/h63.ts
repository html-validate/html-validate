import { TagReadyEvent } from "../../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../../rule";
import html5 from "../../elements/html5";
import { MetaAttribute } from "../../meta";

export default class H63 extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"H63: Using the scope attribute to associate header cells and data cells in data tables",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:ready", (event: TagReadyEvent) => {
			const node = event.target;

			/* only validate th */
			if (!node || node.tagName !== "th") {
				return;
			}

			/* ignore elements with valid scope values */
			const scope = node.getAttributeValue("scope");
			const scopeMeta = html5?.th?.attributes?.scope as MetaAttribute;
			if (scope && scopeMeta.enum?.includes(scope)) {
				return;
			}

			this.report(
				node,
				`<th> element must have a valid scope attribute: ${(scopeMeta.enum ?? []).join(", ")}`,
				node.location
			);
		});
	}
}
