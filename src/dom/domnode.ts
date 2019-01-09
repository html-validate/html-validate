export class DOMNode {
	readonly nodeName: string;

	/**
	 * Set of disabled rules for this node.
	 *
	 * Rules disabled by using directives are added here.
	 */
	private disabledRules: Set<string>;

	constructor(nodeName: string) {
		this.nodeName = nodeName;
		this.disabledRules = new Set();
	}

	/**
	 * Disable a rule for this node.
	 */
	public disableRule(ruleId: string): void {
		this.disabledRules.add(ruleId);
	}

	/**
	 * Enable a previously disabled rule for this node.
	 */
	public enableRule(ruleId: string): void {
		this.disabledRules.delete(ruleId);
	}

	/**
	 * Test if a rule is enabled for this node.
	 */
	public ruleEnabled(ruleId: string): boolean {
		return !this.disabledRules.has(ruleId);
	}
}
