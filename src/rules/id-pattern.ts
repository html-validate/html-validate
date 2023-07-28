import { DynamicValue } from "../dom";
import { type AttributeEvent } from "../event";
import { type PatternName, describePattern, parsePattern } from "../pattern";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

interface RuleOptions {
	pattern: PatternName;
}

const defaults: RuleOptions = {
	pattern: "kebabcase",
};

export default class IdPattern extends Rule<void, RuleOptions> {
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
			description: `For consistency all IDs are required to match the pattern ${pattern}.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			if (event.key.toLowerCase() !== "id") {
				return;
			}

			/* consider dynamic value as always matching the pattern */
			if (event.value instanceof DynamicValue) {
				return;
			}

			if (!event.value?.match(this.pattern)) {
				const value = event.value ?? "";
				const pattern = this.pattern.toString();
				const message = `ID "${value}" does not match required pattern "${pattern}"`;
				this.report(event.target, message, event.valueLocation);
			}
		});
	}
}
