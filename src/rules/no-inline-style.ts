import { AttributeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

export interface RuleOptions {
	include: string[] | null;
	exclude: string[] | null;
}

const defaults: RuleOptions = {
	include: null,
	exclude: null,
};

export default class NoInlineStyle extends Rule<void, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public documentation(): RuleDocumentation {
		return {
			description:
				"Inline style is a sign of unstructured CSS. Use class or ID with a separate stylesheet.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			if (this.isRelevant(event)) {
				this.report(event.target, "Inline style is not allowed");
			}
		});
	}

	private isRelevant(event: AttributeEvent): boolean {
		if (event.key !== "style") {
			return false;
		}

		const { include, exclude } = this.options;
		const key = event.originalAttribute || event.key;

		/* ignore attributes not present in "include" */
		if (include && !include.includes(key)) {
			return false;
		}

		/* ignore attributes present in "exclude" */
		if (exclude && exclude.includes(key)) {
			return false;
		}

		return true;
	}
}
