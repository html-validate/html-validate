import { type RuleConfig, type RuleSeverity } from "../config";
import { parseSeverity } from "./parse-severity";

function parseItem(value: string): { ruleId: string; severity: RuleSeverity } {
	const [ruleId, severity = "error"] = value.split(":", 2);
	return { ruleId, severity: parseSeverity(ruleId, severity) };
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
