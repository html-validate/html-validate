import { NodeClosed } from "../dom";
import { type TagEndEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class VoidContent extends Rule<string> {
	public documentation(tagName: string): RuleDocumentation {
		const doc: RuleDocumentation = {
			description:
				"HTML void elements cannot have any content and must not have content or end tag.",
			url: ruleDocumentationUrl(__filename),
		};
		if (tagName) {
			doc.description = `<${tagName}> is a void element and must not have content or end tag.`;
		}
		return doc;
	}

	public setup(): void {
		this.on("tag:end", (event: TagEndEvent) => {
			const node = event.target; // The current element being closed.

			if (!node) {
				return;
			}

			if (!node.voidElement) {
				return;
			}

			if (node.closed === NodeClosed.EndTag) {
				this.report(
					null,
					`End tag for <${node.tagName}> must be omitted`,
					node.location,
					node.tagName,
				);
			}
		});
	}
}
