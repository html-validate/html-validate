import { type TagStartEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

interface RuleOptions {
	allowTemplate: boolean;
}

const defaults: RuleOptions = {
	allowTemplate: true,
};

export default class NoStyleTag extends Rule<void, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public static override schema(): SchemaObject {
		return {
			allowTemplate: {
				type: "boolean",
			},
		};
	}

	public override documentation(): RuleDocumentation {
		return {
			description:
				"Prefer to use external stylesheets with the `<link>` tag instead of inlining the styling.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		const { allowTemplate } = this.options;
		this.on("tag:start", (event: TagStartEvent) => {
			const node = event.target;
			if (node.tagName === "style") {
				if (allowTemplate && node.parent?.is("template")) {
					return;
				}

				this.report(node, "Use external stylesheet with <link> instead of <style> tag");
			}
		});
	}
}
