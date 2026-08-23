import { type DoctypeEvent } from "../event";
import { sliceLocation } from "../location";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

interface RuleContext {
	style: "uppercase" | "lowercase";
}

interface RuleOptions {
	style: "uppercase" | "lowercase";
}

const defaults: RuleOptions = {
	style: "uppercase",
};

export default class DoctypeStyle extends Rule<RuleContext, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public static override readonly fixable = true;

	public static override schema(): SchemaObject {
		return {
			style: {
				enum: ["lowercase", "uppercase"],
				type: "string",
			},
		};
	}

	public override documentation(context: RuleContext): RuleDocumentation {
		return {
			description: `While DOCTYPE is case-insensitive in the standard the current configuration requires it to be ${context.style}`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("doctype", (event: DoctypeEvent) => {
			/* event.location covers "<!" + keyword + a single trailing whitespace,
			 * the keyword itself is always 7 characters regardless of casing */
			const keywordLocation = sliceLocation(event.location, 2, 9);
			if (this.options.style === "uppercase" && event.tag !== "DOCTYPE") {
				this.report({
					node: null,
					message: "DOCTYPE should be uppercase",
					location: event.location,
					context: this.options,
					fix(fixer) {
						fixer.replaceText(keywordLocation, "DOCTYPE");
					},
				});
			}
			if (this.options.style === "lowercase" && event.tag !== "doctype") {
				this.report({
					node: null,
					message: "DOCTYPE should be lowercase",
					location: event.location,
					context: this.options,
					fix(fixer) {
						fixer.replaceText(keywordLocation, "doctype");
					},
				});
			}
		});
	}
}
