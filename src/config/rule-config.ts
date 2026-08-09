import { type RuleOptions } from "./rule-options";
import { type RuleSeverity } from "./rule-severity";

/**
 * @public
 */
export type RuleConfig = Record<
	string,
	RuleSeverity | [RuleSeverity] | [RuleSeverity, RuleOptions]
>;
