import { NodeClosed } from "../dom";
import { type TagEndEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class ScriptElement extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description:
				"The end tag for `<script>` is a hard requirement and must never be omitted even when using the `src` attribute.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:end", (event: TagEndEvent) => {
			const node = event.target; // The current element being closed.

			if (node?.tagName !== "script") {
				return;
			}

			if (node.closed !== NodeClosed.EndTag) {
				this.report(node, `End tag for <${node.tagName}> must not be omitted`);
			}
		});
	}
}
