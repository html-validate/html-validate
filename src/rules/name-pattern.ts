import { DynamicValue } from "../dom";
import { type AttributeEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, ruleDocumentationUrl } from "../rule";
import {
	type BasePatternRuleContext,
	type BasePatternRuleOptions,
	BasePatternRule,
} from "./base-pattern-rule";

const defaults: BasePatternRuleOptions = {
	pattern: "camelcase",
};

export default class NamePattern extends BasePatternRule {
	public constructor(options: Partial<BasePatternRuleOptions>) {
		super("name", { ...defaults, ...options });
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
			const { meta } = target;

			/* only handle form controls */
			if (!meta?.formAssociated?.listed) {
				return;
			}

			/* only handle name attribute */
			if (key.toLowerCase() !== "name") {
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
			this.validateValue(target, name, valueLocation);
		});
	}
}
