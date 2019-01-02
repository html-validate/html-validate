import { DOMTokenList } from "../dom";
import { AttributeEvent } from "../event";
import { describePattern, parsePattern } from "../pattern";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

const defaults = {
	pattern: "kebabcase",
};

class ClassPattern extends Rule {
	pattern: RegExp;

	constructor(options: object) {
		super(Object.assign({}, defaults, options));
		this.pattern = parsePattern(this.options.pattern);
	}

	documentation(): RuleDocumentation {
		const pattern = describePattern(this.options.pattern);
		return {
			description: `For consistency all classes are required to match the pattern ${pattern}.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	setup() {
		this.on("attr", (event: AttributeEvent) => {
			if (event.key.toLowerCase() !== "class") {
				return;
			}

			const classes = new DOMTokenList(event.value);
			classes.forEach((cur) => {
				if (!cur.match(this.pattern)) {
					this.report(event.target, `Class "${cur}" does not match required pattern "${this.pattern}"`);
				}
			});
		});
	}
}

module.exports = ClassPattern;
