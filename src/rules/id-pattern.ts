import { DynamicValue } from "../dom";
import { type AttributeEvent } from "../event";
import { type NamedPattern, patternNames } from "../pattern";
import { type RuleDocumentation, type SchemaObject, ruleDocumentationUrl } from "../rule";
import {
	type BasePatternRuleContext,
	type BasePatternRuleOptions,
	BasePatternRule,
} from "./base-pattern-rule";

const defaults: BasePatternRuleOptions = {
	pattern: "kebabcase",
};

function exclude(set: Set<NamedPattern>, ...values: NamedPattern[]): Set<NamedPattern> {
	const result = new Set(set);
	for (const value of values) {
		result.delete(value);
	}
	return result;
}

export default class IdPattern extends BasePatternRule {
	public constructor(options: Partial<BasePatternRuleOptions>) {
		const allowedPatterns = exclude(patternNames, "tailwind");
		super({
			ruleId: "id-pattern",
			attr: "id",
			options: { ...defaults, ...options },
			allowedPatterns,
		});
	}

	public static override schema(): SchemaObject {
		return BasePatternRule.schema();
	}

	public override documentation(context: BasePatternRuleContext): RuleDocumentation {
		return {
			description: this.description(context),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			const { target, key, value, valueLocation } = event;

			if (key.toLowerCase() !== "id") {
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

			this.validateValue(target, value, valueLocation);
		});
	}
}
