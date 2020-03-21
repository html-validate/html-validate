import { TagCloseEvent } from "../../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../../rule";

export default class H67 extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"A decorative image cannot have a title attribute. Either remove `title` or add a descriptive `alt` text.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:close", (event: TagCloseEvent) => {
			const node = event.target;

			/* only validate images */
			if (!node || node.tagName !== "img") {
				return;
			}

			/* ignore images without title */
			const title = node.getAttribute("title");
			if (!title || title.value === "") {
				return;
			}

			/* ignore elements with non-empty alt-text */
			const alt = node.getAttributeValue("alt");
			if (alt && alt !== "") {
				return;
			}

			this.report(
				node,
				"<img> with empty alt text cannot have title attribute",
				title.keyLocation
			);
		});
	}
}
