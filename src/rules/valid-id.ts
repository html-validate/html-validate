import { DynamicValue } from "../dom";
import { AttributeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl, SchemaObject } from "../rule";

interface RuleOptions {
	relaxed: boolean;
}

export enum RuleContext {
	EMPTY = 1,
	WHITESPACE,
	LEADING_CHARACTER,
	DISALLOWED_CHARACTER,
}

const defaults: RuleOptions = {
	relaxed: false,
};

export default class ValidID extends Rule<RuleContext, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public static schema(): SchemaObject {
		return {
			relaxed: {
				type: "boolean",
			},
		};
	}

	public documentation(context?: RuleContext): RuleDocumentation {
		const { relaxed } = this.options;
		const message = context
			? this.messages[context].replace("id", "ID").replace(/^(.)/, (m) => m.toUpperCase())
			: "Element ID is not valid";
		const relaxedDescription = relaxed
			? []
			: [
					"  - ID must begin with a letter",
					"  - ID must only contain alphanumerical characters, `-` and `_`",
			  ];
		return {
			description: [
				`${message}.`,
				"",
				"Under the current configuration the following rules are applied:",
				"",
				"  - ID must not be empty",
				"  - ID must not contain any whitespace characters",
				...relaxedDescription,
			].join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", this.isRelevant, (event: AttributeEvent) => {
			const { value } = event;

			if (value === null || value instanceof DynamicValue) {
				return;
			}

			if (value === "") {
				const context = RuleContext.EMPTY;
				this.report(event.target, this.messages[context], event.location, context);
				return;
			}

			if (value.match(/\s/)) {
				const context = RuleContext.WHITESPACE;
				this.report(event.target, this.messages[context], event.valueLocation, context);
				return;
			}

			const { relaxed } = this.options;
			if (relaxed) {
				return;
			}

			if (value.match(/^[^a-zA-Z]/)) {
				const context = RuleContext.LEADING_CHARACTER;
				this.report(event.target, this.messages[context], event.valueLocation, context);
				return;
			}

			if (value.match(/[^a-zA-Z0-9-_]/)) {
				const context = RuleContext.DISALLOWED_CHARACTER;
				this.report(event.target, this.messages[context], event.valueLocation, context);
			}
		});
	}

	protected get messages(): Record<RuleContext, string> {
		return {
			[RuleContext.EMPTY]: "element id must not be empty",
			[RuleContext.WHITESPACE]: "element id must not contain whitespace",
			[RuleContext.LEADING_CHARACTER]: "element id must begin with a letter",
			[RuleContext.DISALLOWED_CHARACTER]:
				"element id must only contain alphanumerical, dash and underscore characters",
		};
	}

	protected isRelevant(this: void, event: AttributeEvent): boolean {
		return event.key === "id";
	}
}
