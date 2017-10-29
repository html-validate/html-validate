type RuleSeverity = "disable" | "warn" | "error" | number;

export interface ConfigData {
	extends: string[];
	rules: { [key: string]: RuleSeverity | [RuleSeverity, any] };
}
