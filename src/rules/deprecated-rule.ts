import { Severity } from "../config/severity";
import { type ConfigReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

type RuleContext = string;

export default class DeprecatedRule extends Rule<RuleContext> {
	public override documentation(context: RuleContext): RuleDocumentation {
		const preamble = context ? `The rule "${context}"` : "This rule";
		return {
			description: `${preamble} is deprecated and should not be used any longer, consult documentation for further information.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("config:ready", (event: ConfigReadyEvent) => {
			for (const rule of this.getDeprecatedRules(event)) {
				if (rule.getSeverity() > Severity.DISABLED) {
					this.report(null, `Usage of deprecated rule "${rule.name}"`, null, rule.name);
				}
			}
		});
	}

	private getDeprecatedRules(event: ConfigReadyEvent): Array<Rule<unknown, unknown>> {
		const rules = Object.values(event.rules);
		return rules.filter((rule) => rule.deprecated);
	}
}
