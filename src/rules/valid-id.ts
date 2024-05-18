import { DynamicValue } from "../dom";
import { type AttributeEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

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

	public documentation(context: RuleContext): RuleDocumentation {
		const { relaxed } = this.options;
		const message = this.messages[context]
			.replace("id", "ID")
			.replace(/^(.)/, (m) => m.toUpperCase());
		const relaxedDescription = relaxed
			? []
			: [
					"  - ID must begin with a letter",
					"  - ID must only contain letters, digits, `-` and `_`",
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

			if (value.match(/^[^\p{L}]/u)) {
				const context = RuleContext.LEADING_CHARACTER;
				this.report(event.target, this.messages[context], event.valueLocation, context);
				return;
			}

			if (value.match(/[^\p{L}\p{N}_-]/u)) {
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
				"element id must only contain letters, digits, dash and underscore characters",
		};
	}

	protected isRelevant(this: void, event: AttributeEvent): boolean {
		return event.key === "id";
	}
}
