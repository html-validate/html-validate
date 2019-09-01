import { Severity } from "../config";
import { ConfigReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class DeprecatedRule extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"This rule is deprecated and should not be used any longer, consult documentation for further information.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("config:ready", (event: ConfigReadyEvent) => {
			for (const rule of this.getDeprecatedRules(event)) {
				if (rule.getSeverity() > Severity.DISABLED) {
					this.report(null, `Usage of deprecated rule "${rule.name}"`);
					continue;
				}
			}
		});
	}

	private getDeprecatedRules(event: ConfigReadyEvent): Rule[] {
		const rules = Object.values(event.rules);
		return rules.filter(rule => rule.deprecated);
	}
}

module.exports = DeprecatedRule;
