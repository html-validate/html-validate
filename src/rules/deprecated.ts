import { sliceLocation, Location } from "../context";
import { HtmlElement } from "../dom";
import { TagOpenEvent } from "../event";
import { DeprecatedElement } from "../meta/element";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

interface Context extends DeprecatedElement {
	tagName: string;
}

class Deprecated extends Rule<Context> {
	public documentation(context?: Context): RuleDocumentation {
		const doc: RuleDocumentation = {
			description:
				"This element is deprecated and should not be used in new code.",
			url: ruleDocumentationUrl(__filename),
		};
		if (context) {
			const text: string[] = [];
			if (context.source) {
				const source = prettySource(context.source);
				const message = `The \`<$tagname>\` element is deprecated ${source} and should not be used in new code.`;
				text.push(message);
			} else {
				const message = `The \`<$tagname>\` element is deprecated and should not be used in new code.`;
				text.push(message);
			}
			if (context.documentation) {
				text.push(context.documentation);
			}
			doc.description = text
				.map(cur => cur.replace(/\$tagname/g, context.tagName))
				.join("\n\n");
		}
		return doc;
	}

	public setup(): void {
		this.on("tag:open", (event: TagOpenEvent) => {
			const node = event.target;

			/* cannot validate if meta isn't known */
			if (node.meta === null) {
				return;
			}

			const deprecated = node.meta.deprecated;
			if (deprecated) {
				const location = sliceLocation(event.location, 1);

				if (typeof deprecated === "string") {
					this.reportString(deprecated, node, location);
				} else if (typeof deprecated === "boolean") {
					this.reportBoolean(node, location);
				} else {
					this.reportObject(deprecated, node, location);
				}
			}
		});
	}

	private reportString(
		deprecated: string,
		node: HtmlElement,
		location: Location
	): void {
		const context: Context = { tagName: node.tagName };
		const message = `<${node.tagName}> is deprecated: ${deprecated}`;
		this.report(node, message, location, context);
	}

	private reportBoolean(node: HtmlElement, location: Location): void {
		const context: Context = { tagName: node.tagName };
		const message = `<${node.tagName}> is deprecated`;
		this.report(node, message, location, context);
	}

	private reportObject(
		deprecated: DeprecatedElement,
		node: HtmlElement,
		location: Location
	): void {
		const context: Context = { ...deprecated, tagName: node.tagName };
		const message = `<${node.tagName}> is deprecated${
			deprecated.message ? `: ${deprecated.message}` : ""
		}`;
		this.report(node, message, location, context);
	}
}

function prettySource(source: string): string {
	const match = source.match(/html(\d)(\d)?/);
	if (match) {
		const [, major, minor] = match;
		return `in HTML ${major}${minor ? `.${minor}` : ""}`;
	}

	switch (source) {
		case "whatwg":
			return "in HTML Living Standard";
		case "non-standard":
			return "and non-standard";
		default:
			return `by ${source}`;
	}
}

module.exports = Deprecated;
