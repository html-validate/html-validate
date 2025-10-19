import { type TagEndEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

const javascript = [
	"",
	"application/ecmascript",
	"application/javascript",
	"text/ecmascript",
	"text/javascript",
];

export default class ScriptType extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description:
				"While valid the HTML5 standard encourages authors to omit the type element for JavaScript resources.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:end", (event: TagEndEvent) => {
			const node = event.previous;

			if (node.tagName !== "script") {
				return;
			}

			const attr = node.getAttribute("type");
			if (!attr || attr.isDynamic) {
				return;
			}

			const value = attr.value ? attr.value.toString() : "";
			if (!this.isJavascript(value)) {
				return;
			}

			this.report(
				node,
				'"type" attribute is unnecessary for javascript resources',
				attr.keyLocation,
			);
		});
	}

	private isJavascript(mime: string): boolean {
		/* remove mime parameters, e.g. ";charset=utf-8" */
		const type = mime.replace(/;.*/, "");
		return javascript.includes(type);
	}
}
