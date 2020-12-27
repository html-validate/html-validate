import { TagCloseEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

const javascript = [
	"",
	"application/ecmascript",
	"application/javascript",
	"text/ecmascript",
	"text/javascript",
];

export default class ScriptType extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"While valid the HTML5 standard encourages authors to omit the type element for JavaScript resources.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:close", (event: TagCloseEvent) => {
			const node = event.previous;

			if (!node || node.tagName !== "script") {
				return;
			}

			const attr = node.getAttribute("type");
			if (!attr || attr.isDynamic) {
				return;
			}

			const value = attr.value.toString();
			if (!this.isJavascript(value)) {
				return;
			}

			this.report(
				node,
				'"type" attribute is unnecessary for javascript resources',
				attr.keyLocation
			);
		});
	}

	private isJavascript(mime: string): boolean {
		const match = mime.match(/^(.*?)(?:\s*;.*)?$/);
		return match ? javascript.includes(match[1]) : false;
	}
}
