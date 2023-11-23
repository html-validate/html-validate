import { DynamicValue } from "../dom";
import { type AttributeEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

interface RuleContext {
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

export default class NoAutoplay extends Rule<RuleContext, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public documentation(context: RuleContext): RuleDocumentation {
		return {
			description: [
				`The autoplay attribute is not allowed on <${context.tagName}>.`,
				"Autoplaying content can be disruptive for users and has accessibilty concerns.",
				"Prefer to let the user control playback.",
			].join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
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

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			/* only handle autoplay attribute */
			if (event.key.toLowerCase() !== "autoplay") {
				return;
			}

			/* ignore dynamic values */
			if (event.value && event.value instanceof DynamicValue) {
				return;
			}

			/* ignore tagnames configured to be ignored */
			const tagName = event.target.tagName;
			if (this.isKeywordIgnored(tagName)) {
				return;
			}

			/* report error */
			const context: RuleContext = { tagName };
			const location = event.location;
			this.report(
				event.target,
				`The autoplay attribute is not allowed on <${tagName}>`,
				location,
				context,
			);
		});
	}
}
