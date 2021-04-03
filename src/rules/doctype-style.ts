import { DoctypeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl, SchemaObject } from "../rule";

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

	public documentation(context?: RuleContext): RuleDocumentation {
		const doc: RuleDocumentation = {
			description: `While DOCTYPE is case-insensitive in the standard the current configuration requires a specific style.`,
			url: ruleDocumentationUrl(__filename),
		};
		if (context) {
			doc.description = `While DOCTYPE is case-insensitive in the standard the current configuration requires it to be ${context.style}`;
		}
		return doc;
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
