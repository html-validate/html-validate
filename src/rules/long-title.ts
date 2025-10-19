import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

interface RuleOptions {
	maxlength: number;
}

const defaults: RuleOptions = {
	maxlength: 70,
};

export default class LongTitle extends Rule<void, RuleOptions> {
	private maxlength: number;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.maxlength = this.options.maxlength;
	}

	public static override schema(): SchemaObject {
		return {
			maxlength: {
				type: "number",
			},
		};
	}

	public override documentation(): RuleDocumentation {
		return {
			description: `Search engines truncates titles with long text, possibly down-ranking the page in the process.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:end", (event) => {
			const node = event.previous;
			if (node.tagName !== "title") return;

			const text = node.textContent;
			if (text.length > this.maxlength) {
				this.report(node, `title text cannot be longer than ${String(this.maxlength)} characters`);
			}
		});
	}
}
