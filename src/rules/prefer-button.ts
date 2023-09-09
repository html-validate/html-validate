import { type AttributeEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";
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
		const src = `<input type="${context.type}">`;
		const dst = replacement[context.type] || `<button>`;
		return {
			description: `Prefer to use \`${dst}\` instead of \`"${src}\`.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			const node = event.target;

			/* only handle input elements */
			if (node.tagName.toLowerCase() !== "input") {
				return;
			}

			/* only handle type attribute */
			if (event.key.toLowerCase() !== "type") {
				return;
			}

			/* sanity check: handle missing, boolean and dynamic attributes */
			if (!event.value || event.value instanceof DynamicValue) {
				return;
			}

			/* ignore types configured to be ignored */
			const type = event.value.toLowerCase();
			if (this.isKeywordIgnored(type)) {
				return;
			}

			/* only values matching known type triggers error */
			if (!types.includes(type)) {
				return;
			}

			const context: RuleContext = { type };
			const message = `Prefer to use <button> instead of <input type="${type}"> when adding buttons`;
			this.report(node, message, event.valueLocation, context);
		});
	}
}
