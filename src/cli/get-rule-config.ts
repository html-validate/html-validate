import { Severity, type RuleConfig } from "..";
import { parseSeverity } from "./parse-severity";

function parseItem(value: string): { ruleId: string; severity: Severity } {
	if (value.includes(":")) {
		const [ruleId, severity] = value.split(":", 2);
		return { ruleId, severity: parseSeverity(ruleId, severity) };
	} else {
		return { ruleId: value, severity: Severity.ERROR };
	}
}

/**
 * @internal
 */
export function getRuleConfig(values: string | string[]): RuleConfig {
	if (typeof values === "string") {
		return getRuleConfig([values]);
	}

	return values.reduce<RuleConfig>((parsedRules, value) => {
		const { ruleId, severity } = parseItem(value.trim());
		return { [ruleId]: severity, ...parsedRules };
	}, {});
}
