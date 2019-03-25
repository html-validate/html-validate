import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

const defaults = {
	maxlength: 70,
};

class LongTitle extends Rule {
	private maxlength: number;

	constructor(options: object) {
		super(Object.assign({}, defaults, options));
		this.maxlength = parseInt(this.options.maxlength, 10);
	}

	public documentation(): RuleDocumentation {
		return {
			description: `Search engines truncates titles with long text, possibly down-ranking the page in the process.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup() {
		this.on("tag:close", event => {
			const node = event.previous;
			if (node.tagName !== "title") return;

			const text = node.textContent;
			if (text.length > this.maxlength) {
				this.report(
					node,
					`title text cannot be longer than ${this.maxlength} characters`
				);
			}
		});
	}
}

module.exports = LongTitle;
