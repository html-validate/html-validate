import { AttributeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl, SchemaObject } from "../rule";
import { DynamicValue } from "../dom";

interface RuleContext {
	type: string;
}

interface RuleOptions {
	include: string[] | null;
	exclude: string[] | null;
}

export const types = ["button", "submit", "reset", "image"];
const replacement: Record<string, string> = {
	button: '<button type="button">',
	submit: '<button type="submit">',
	reset: '<button type="reset">',
	image: '<button type="button">',
};

const defaults: RuleOptions = {
	include: null,
	exclude: null,
};

export default class PreferButton extends Rule<RuleContext, RuleOptions> {
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
		const doc: RuleDocumentation = {
			description: `Prefer to use the generic \`<button>\` element instead of \`<input>\`.`,
			url: ruleDocumentationUrl(__filename),
		};
		if (context) {
			const src = `<input type="${context.type}">`;
			const dst = replacement[context.type] || `<button>`;
			doc.description = `Prefer to use \`${dst}\` instead of \`"${src}\`.`;
		}
		return doc;
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			const node = event.target;

			/* only handle input elements */
			if (node.tagName !== "input") {
				return;
			}

			/* sanity check: handle missing, boolean and dynamic attributes */
			if (!event.value || event.value instanceof DynamicValue) {
				return;
			}

			/* ignore types configured to be ignored */
			if (this.isKeywordIgnored(event.value)) {
				return;
			}

			/* only values matching known type triggers error */
			if (!types.includes(event.value)) {
				return;
			}

			const context: RuleContext = { type: event.value };
			const message = `Prefer to use <button> instead of <input type="${event.value}"> when adding buttons`;
			this.report(node, message, event.valueLocation, context);
		});
	}
}
