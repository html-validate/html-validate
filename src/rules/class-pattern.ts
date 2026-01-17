import { DOMTokenList } from "../dom";
import { type AttributeEvent } from "../event";
import { patternNames } from "../pattern";
import { type RuleDocumentation, type SchemaObject, ruleDocumentationUrl } from "../rule";
import {
	type BasePatternRuleContext,
	type BasePatternRuleOptions,
	BasePatternRule,
} from "./base-pattern-rule";

const defaults: BasePatternRuleOptions = {
	pattern: "kebabcase",
};

export default class ClassPattern extends BasePatternRule {
	public constructor(options: Partial<BasePatternRuleOptions>) {
		super({
			ruleId: "class-pattern",
			attr: "class",
			options: { ...defaults, ...options },
			allowedPatterns: patternNames, // allow all patterns
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

			if (key.toLowerCase() !== "class") {
				return;
			}

			const classes = new DOMTokenList(value, valueLocation);
			for (const { item, location } of classes.iterator()) {
				this.validateValue(target, item, location);
			}
		});
	}
}
