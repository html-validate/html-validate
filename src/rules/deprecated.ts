import { type Location, sliceLocation } from "../context";
import { type HtmlElement } from "../dom";
import { type TagStartEvent } from "../event";
import { type DeprecatedElement } from "../meta/element";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

interface RuleContext extends DeprecatedElement {
	tagName: string;
}

interface RuleOptions {
	include: string[] | null;
	exclude: string[] | null;
}

const defaults: RuleOptions = {
	include: null,
	exclude: null,
};

export default class Deprecated extends Rule<RuleContext, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public static schema(): SchemaObject {
		return {
			exclude: {
				anyOf: [
					{
						items: {
							type: "string",
						},
						type: "array",
					},
					{
						type: "null",
					},
				],
			},
			include: {
				anyOf: [
					{
						items: {
							type: "string",
						},
						type: "array",
					},
					{
						type: "null",
					},
				],
			},
		};
	}

	public documentation(context: RuleContext): RuleDocumentation {
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
		const doc: RuleDocumentation = {
			description: text.map((cur) => cur.replace(/\$tagname/g, context.tagName)).join("\n\n"),
			url: ruleDocumentationUrl(__filename),
		};
		return doc;
	}

	public setup(): void {
		this.on("tag:start", (event: TagStartEvent) => {
			const node = event.target;

			/* cannot validate if meta isn't known */
			if (node.meta === null) {
				return;
			}

			/* ignore if element is not deprecated */
			const deprecated = node.meta.deprecated;
			if (!deprecated) {
				return;
			}

			/* ignore if element is ignored by used configuration */
			if (this.isKeywordIgnored(node.tagName)) {
				return;
			}

			const location = sliceLocation(event.location, 1);

			if (typeof deprecated === "string") {
				this.reportString(deprecated, node, location);
			} else if (typeof deprecated === "boolean") {
				this.reportBoolean(node, location);
			} else {
				this.reportObject(deprecated, node, location);
			}
		});
	}

	private reportString(deprecated: string, node: HtmlElement, location: Location): void {
		const context: RuleContext = { tagName: node.tagName };
		const message = `<${node.tagName}> is deprecated: ${deprecated}`;
		this.report(node, message, location, context);
	}

	private reportBoolean(node: HtmlElement, location: Location): void {
		const context: RuleContext = { tagName: node.tagName };
		const message = `<${node.tagName}> is deprecated`;
		this.report(node, message, location, context);
	}

	private reportObject(deprecated: DeprecatedElement, node: HtmlElement, location: Location): void {
		const context: RuleContext = { ...deprecated, tagName: node.tagName };
		const notice = deprecated.message ? `: ${deprecated.message}` : "";
		const message = `<${node.tagName}> is deprecated${notice}`;
		this.report(node, message, location, context);
	}
}

function prettySource(source: string): string {
	const match = /html(\d)(\d)?/.exec(source);
	if (match) {
		const [, ...parts] = match;
		const version = parts.filter(Boolean).join(".");
		return `in HTML ${version}`;
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
