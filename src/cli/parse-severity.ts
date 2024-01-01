import { Severity } from "..";

/**
 * @internal
 */
export function parseSeverity(ruleId: string, severity: string): Severity {
	switch (severity) {
		case "off":
		case "0":
			return Severity.DISABLED;
		case "warn":
		case "1":
			return Severity.WARN;
		case "error":
		case "2":
			return Severity.ERROR;
		default:
			throw new Error(`Invalid severity "${severity}" for rule "${ruleId}"`);
	}
}
