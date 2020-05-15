import { DynamicValue } from "../dom";
import { AttributeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

interface RuleContext {
	tagName: string;
}

interface RuleOptions {
	include: string[] | null;
	exclude: string[] | null;
}

const defaults: RuleOptions = {
	include: null,
	exclude: null,
};

export default class NoAutoplay extends Rule<RuleContext, RuleOptions> {
	public constructor(options: RuleOptions) {
		super(Object.assign({}, defaults, options));
	}

	public documentation(context: RuleContext): RuleDocumentation {
		return {
			description: [
				`The autoplay attribute is not allowed${
					context ? ` on <${context.tagName}>` : ""
				}.`,
				"Autoplaying content can be disruptive for users and has accessibilty concerns.",
				"Prefer to let the user control playback.",
			].join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			/* only handle autoplay attribute */
			if (event.key.toLowerCase() !== "autoplay") {
				return;
			}

			/* ignore dynamic values */
			if (event.value && event.value instanceof DynamicValue) {
				return;
			}

			/* ignore tagnames configured to be ignored */
			const tagName = event.target.tagName;
			if (this.isKeywordIgnored(tagName)) {
				return;
			}

			/* report error */
			const context: RuleContext = { tagName };
			const location = event.location;
			this.report(
				event.target,
				`The autoplay attribute is not allowed on <${tagName}>`,
				location,
				context
			);
		});
	}
}
