import { DynamicValue } from "../dom";
import { type AttributeEvent } from "../event";
import { type PatternName, describePattern, parsePattern } from "../pattern";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

interface RuleOptions {
	pattern: PatternName;
}

const defaults: RuleOptions = {
	pattern: "camelcase",
};

export default class NamePattern extends Rule<void, RuleOptions> {
	private pattern: RegExp;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.pattern = parsePattern(this.options.pattern);
	}

	public static schema(): SchemaObject {
		return {
			pattern: {
				type: "string",
			},
		};
	}

	public documentation(): RuleDocumentation {
		const pattern = describePattern(this.options.pattern);
		return {
			description: `For consistency all names are required to match the pattern ${pattern}.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			const { target, value } = event;
			const { meta } = target;

			/* only handle form controls */
			if (!meta?.formAssociated?.listed) {
				return;
			}

			if (event.key.toLowerCase() !== "name") {
				return;
			}

			/* consider dynamic value as always matching the pattern */
			if (value instanceof DynamicValue) {
				return;
			}

			/* omitted value is always valid */
			if (value === null) {
				return;
			}

			const name = value.endsWith("[]") ? value.slice(0, -2) : value;
			if (!name.match(this.pattern)) {
				const pattern = this.pattern.toString();
				const message = `name "${name}" does not match required pattern "${pattern}"`;
				this.report(event.target, message, event.valueLocation);
			}
		});
	}
}
