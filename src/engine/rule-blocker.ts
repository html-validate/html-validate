/**
 * @internal
 */
export type RuleBlocker = number & { __type: "rule-blocker" };

const state = {
	blockerCounter: 1,
};

/**
 * Creates a new rule blocker for using when blocking rules from generating
 * errors.
 *
 * @internal
 */
export function createBlocker(): RuleBlocker {
	const id = state.blockerCounter++;
	return id as RuleBlocker;
}
