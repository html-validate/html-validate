import { type TagReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

interface RuleContext {
	attribute: string;
	type: string;
}

const restricted = new Map<string, string[]>([
	["accept", ["file"]],
	["alt", ["image"]],
	["capture", ["file"]],
	["checked", ["checkbox", "radio"]],
	["dirname", ["text", "search"]],
	["height", ["image"]],
	[
		"list",
		[
			"text",
			"search",
			"url",
			"tel",
			"email",
			"date",
			"month",
			"week",
			"time",
			"datetime-local",
			"number",
			"range",
			"color",
		],
	],
	["max", ["date", "month", "week", "time", "datetime-local", "number", "range"]],
	["maxlength", ["text", "search", "url", "tel", "email", "password"]],
	["min", ["date", "month", "week", "time", "datetime-local", "number", "range"]],
	["minlength", ["text", "search", "url", "tel", "email", "password"]],
	["multiple", ["email", "file"]],
	["pattern", ["text", "search", "url", "tel", "email", "password"]],
	["placeholder", ["text", "search", "url", "tel", "email", "password", "number"]],
	[
		"readonly",
		[
			"text",
			"search",
			"url",
			"tel",
			"email",
			"password",
			"date",
			"month",
			"week",
			"time",
			"datetime-local",
			"number",
		],
	],
	[
		"required",
		[
			"text",
			"search",
			"url",
			"tel",
			"email",
			"password",
			"date",
			"month",
			"week",
			"time",
			"datetime-local",
			"number",
			"checkbox",
			"radio",
			"file",
		],
	],
	["size", ["text", "search", "url", "tel", "email", "password"]],
	["src", ["image"]],
	["step", ["date", "month", "week", "time", "datetime-local", "number", "range"]],
	["width", ["image"]],
]);

function isInput(event: TagReadyEvent): boolean {
	const { target } = event;
	return target.is("input");
}

export default class InputAttributes extends Rule<RuleContext> {
	public documentation(context: RuleContext): RuleDocumentation {
		const { attribute, type } = context;
		const summary = `Attribute \`${attribute}\` is not allowed on \`<input type="${type}">\`\n`;
		const details = `\`${attribute}\` can only be used when \`type\` is:`;
		const list = restricted.get(attribute)?.map((it) => `- \`${it}\``) ?? [];
		return {
			description: [summary, details, ...list].join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:ready", isInput, (event: TagReadyEvent) => {
			const { target } = event;

			const type = target.getAttribute("type");
			if (!type || type.isDynamic || !type.value) {
				return;
			}
			const typeValue = type.value.toString();

			for (const attr of target.attributes) {
				const validTypes = restricted.get(attr.key);
				if (!validTypes) {
					continue;
				}

				if (validTypes.includes(typeValue)) {
					continue;
				}

				const context: RuleContext = {
					attribute: attr.key,
					type: typeValue,
				};
				const message = `Attribute "${attr.key}" is not allowed on <input type="${typeValue}">`;
				this.report(target, message, attr.keyLocation, context);
			}
		});
	}
}
