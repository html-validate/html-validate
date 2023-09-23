import { type DoctypeEvent } from "../event";
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

	public static schema(): SchemaObject {
		return {
			style: {
				enum: ["lowercase", "uppercase"],
				type: "string",
			},
		};
	}

	public documentation(context: RuleContext): RuleDocumentation {
		return {
			description: `While DOCTYPE is case-insensitive in the standard the current configuration requires it to be ${context.style}`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("doctype", (event: DoctypeEvent) => {
			if (this.options.style === "uppercase" && event.tag !== "DOCTYPE") {
				this.report(null, "DOCTYPE should be uppercase", event.location, this.options);
			}
			if (this.options.style === "lowercase" && event.tag !== "doctype") {
				this.report(null, "DOCTYPE should be lowercase", event.location, this.options);
			}
		});
	}
}
