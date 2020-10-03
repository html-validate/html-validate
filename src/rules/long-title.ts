import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

interface RuleOptions {
	maxlength: number;
}

const defaults: RuleOptions = {
	maxlength: 70,
};

export default class LongTitle extends Rule<void, RuleOptions> {
	private maxlength: number;

	public constructor(options: RuleOptions) {
		super(Object.assign({}, defaults, options));
		this.maxlength = this.options.maxlength;
	}

	public documentation(): RuleDocumentation {
		return {
			description: `Search engines truncates titles with long text, possibly down-ranking the page in the process.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:close", (event) => {
			const node = event.previous;
			if (node.tagName !== "title") return;

			const text = node.textContent;
			if (text.length > this.maxlength) {
				this.report(node, `title text cannot be longer than ${this.maxlength} characters`);
			}
		});
	}
}
