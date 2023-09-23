import { type TagReadyEvent } from "../../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../../rule";
import html5 from "../../elements/html5";
import { type MetaAttribute } from "../../meta";
import { naturalJoin } from "../../utils/natural-join";
import { DynamicValue } from "../../dom";

/* istanbul ignore next: this will always be present for the <th>
 * attribute (or the tests would fail) */
const { enum: validScopes } = html5.th.attributes?.scope as MetaAttribute & { enum: string[] };

const joinedScopes = naturalJoin(validScopes);

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
			if (node.tagName !== "th") {
				return;
			}

			const scope = node.getAttribute("scope");
			const value = scope?.value;

			/* ignore dynamic scope */
			if (value instanceof DynamicValue) {
				return;
			}

			/* ignore elements with valid scope values */
			if (value && validScopes.includes(value)) {
				return;
			}

			const message = `<th> element must have a valid scope attribute: ${joinedScopes}`;
			const location = scope?.valueLocation ?? scope?.keyLocation ?? node.location;
			this.report(node, message, location);
		});
	}
}
