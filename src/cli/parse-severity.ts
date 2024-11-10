import { type RuleSeverity } from "../config";

/**
 * @internal
 */
export function parseSeverity(ruleId: string, severity: string): RuleSeverity {
	switch (severity) {
		case "off":
		case "0":
			return "off";
		case "warn":
		case "1":
			return "warn";
		case "error":
		case "2":
			return "error";
		default:
			throw new Error(`Invalid severity "${severity}" for rule "${ruleId}"`);
	}
}
