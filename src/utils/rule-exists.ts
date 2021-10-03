import rules from "../rules";

const ruleIds = new Set<string>(Object.keys(rules));

/**
 * Returns true if given ruleId is an existing builtin rule. It does not handle
 * rules loaded via plugins.
 *
 * Can be used to create forward/backward compatibility by checking if a rule
 * exists to enable/disable it.
 *
 * @public
 * @param ruleId - Rule id to check
 * @returns `true` if rule exists
 */
export function ruleExists(ruleId: string): boolean {
	return ruleIds.has(ruleId);
}
