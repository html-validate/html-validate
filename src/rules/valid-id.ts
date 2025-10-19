import { DynamicValue } from "../dom";
import { type AttributeEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";
import { interpolate } from "../utils/interpolate";

interface RuleOptions {
	relaxed: boolean;
}

/**
 * @internal
 */
export enum ErrorKind {
	EMPTY = 1,
	WHITESPACE,
	LEADING_CHARACTER,
	DISALLOWED_CHARACTER,
}

export interface RuleContext {
	kind: ErrorKind;
	id: string;
}

const defaults: RuleOptions = {
	relaxed: false,
};

export default class ValidID extends Rule<RuleContext, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public static override schema(): SchemaObject {
		return {
			relaxed: {
				type: "boolean",
			},
		};
	}

	public override documentation(context: RuleContext): RuleDocumentation {
		const { relaxed } = this.options;
		const { kind, id } = context;
		const message = this.messages[kind]
			.replace(`"{{ id }}"`, "`{{ id }}`")
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
				`${interpolate(message, { id })}.`,
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
				const context: RuleContext = { kind: ErrorKind.EMPTY, id: value };
				this.report(event.target, this.messages[context.kind], event.location, context);
				return;
			}

			if (/\s/.exec(value)) {
				const context: RuleContext = { kind: ErrorKind.WHITESPACE, id: value };
				this.report(event.target, this.messages[context.kind], event.valueLocation, context);
				return;
			}

			const { relaxed } = this.options;
			if (relaxed) {
				return;
			}

			if (/^[^\p{L}]/u.exec(value)) {
				const context: RuleContext = { kind: ErrorKind.LEADING_CHARACTER, id: value };
				this.report(event.target, this.messages[context.kind], event.valueLocation, context);
				return;
			}

			if (/[^\p{L}\p{N}_-]/u.exec(value)) {
				const context: RuleContext = { kind: ErrorKind.DISALLOWED_CHARACTER, id: value };
				this.report(event.target, this.messages[context.kind], event.valueLocation, context);
			}
		});
	}

	protected get messages(): Record<ErrorKind, string> {
		return {
			[ErrorKind.EMPTY]: `element id "{{ id }}" must not be empty`,
			[ErrorKind.WHITESPACE]: `element id "{{ id }}" must not contain whitespace`,
			[ErrorKind.LEADING_CHARACTER]: `element id "{{ id }}" must begin with a letter`,
			[ErrorKind.DISALLOWED_CHARACTER]: `element id "{{ id }}" must only contain letters, digits, dash and underscore characters`,
		};
	}

	protected isRelevant(this: void, event: AttributeEvent): boolean {
		return event.key === "id";
	}
}
