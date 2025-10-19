import { type Location } from "../context";
import { DOMTokenList } from "../dom";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export interface RuleContext {
	ruleId: string;
}

export default class NoUnusedDisable extends Rule<RuleContext> {
	public override documentation(context: RuleContext): RuleDocumentation {
		return {
			description: `\`${context.ruleId}\` rule is disabled but no error was reported.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		/* this is a special rule, the `Engine` class directly emits errors on this
		 * rule, it exists only to be able to configure whenever the rule is enabled
		 * or not and to get the regular documentation and contextual help. */
	}

	public reportUnused(unused: Set<string>, options: string, location: Location): void {
		const tokens = new DOMTokenList(options.replace(/,/g, " "), location);
		for (const ruleId of unused) {
			const index = tokens.indexOf(ruleId);
			/* istanbul ignore next: the token should be present or it wouldn't be
			 * reported as unused, this is just a sanity check and fallback */
			const tokenLocation = index >= 0 ? tokens.location(index) : location;
			this.report({
				node: null,
				message: '"{{ ruleId }}" rule is disabled but no error was reported',
				location: tokenLocation,
				context: {
					ruleId,
				},
			});
		}
	}
}
