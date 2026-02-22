import { DOMTokenList } from "../dom";
import { type AttributeEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";
import { naturalJoin } from "../utils/natural-join";
import { quote } from "../utils/quote";

interface DeprecatedEntry {
	class: string;
	message?: string;
	replacement?: string | string[];
	url?: string;
}

interface NormalizedEntry {
	class: string;
	message?: string;
	replacement: string[];
	url?: string;
}

export interface RuleContext {
	class: string;
	message: string | null;
	replacement: string[];
	url: string | null;
}

interface RuleOptions {
	classes: DeprecatedEntry[];
}

const defaults: RuleOptions = {
	classes: [],
};

function isRelevant(event: AttributeEvent): boolean {
	return event.key.toLowerCase() === "class";
}

function normalizeEntry(entry: DeprecatedEntry): NormalizedEntry {
	const { class: className, message, replacement = [], url } = entry;
	return {
		class: className,
		message,
		replacement: Array.isArray(replacement) ? replacement : [replacement],
		url,
	};
}

function formatDeprecatedMessage(className: string, entry: NormalizedEntry): string {
	let message = `class "${className}" is deprecated`;

	if (entry.replacement.length > 0) {
		const joined = naturalJoin(
			entry.replacement.map((r) => quote(r)),
			"or",
		);
		message += ` and replaced with ${joined}`;
	}

	if (entry.message) {
		message += `: ${entry.message}`;
	}

	return message;
}

function formatDocumentationDescription(context: RuleContext): string {
	const text: string[] = [];
	const className = context.class;

	let description = `The class \`${className}\` is deprecated and should not be used`;

	if (context.message) {
		description += `: ${context.message}.`;
	} else {
		description += ".";
	}

	text.push(description);

	if (context.replacement.length === 1) {
		text.push(`Use the replacement class ${quote(context.replacement[0], "`")} instead.`);
	} else if (context.replacement.length > 1) {
		const listItems = context.replacement.map((r) => `- ${quote(r, "`")}`);
		text.push(`Use one of the following replacement classes instead:\n${listItems.join("\n")}`);
	}

	if (context.url) {
		text.push(`For details see: ${context.url}`);
	}

	return text.join("\n\n");
}

export default class DeprecatedClass extends Rule<RuleContext, RuleOptions> {
	private deprecatedMap: Map<string, NormalizedEntry>;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		const { classes } = this.options;
		this.deprecatedMap = new Map(classes.map((entry) => [entry.class, normalizeEntry(entry)]));
	}

	public static override schema(): SchemaObject {
		return {
			classes: {
				type: "array",
				items: {
					type: "object",
					properties: {
						class: {
							type: "string",
						},
						message: {
							type: "string",
						},
						replacement: {
							anyOf: [
								{
									type: "string",
								},
								{
									type: "array",
									items: {
										type: "string",
									},
								},
							],
						},
						url: {
							type: "string",
						},
					},
					required: ["class"],
					additionalProperties: false,
				},
			},
		};
	}

	public override documentation(context: RuleContext): RuleDocumentation {
		return {
			description: formatDocumentationDescription(context),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public override setup(): void {
		this.on("attr", isRelevant, (event: AttributeEvent) => {
			const { value, valueLocation, target } = event;
			const classes = new DOMTokenList(value, valueLocation);

			for (const { item, location } of classes.iterator()) {
				const deprecatedEntry = this.deprecatedMap.get(item);
				if (!deprecatedEntry) {
					continue;
				}

				const message = formatDeprecatedMessage(item, deprecatedEntry);
				const context: RuleContext = {
					class: item,
					message: deprecatedEntry.message ?? null,
					replacement: deprecatedEntry.replacement,
					url: deprecatedEntry.url ?? null,
				};
				this.report({
					node: target,
					message,
					location,
					context,
				});
			}
		});
	}
}
