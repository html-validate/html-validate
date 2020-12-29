import { DOMTokenList } from "../dom";
import { AttributeEvent } from "../event";
import { describePattern, parsePattern, PatternName } from "../pattern";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

interface RuleOptions {
	pattern: PatternName;
}

const defaults: RuleOptions = {
	pattern: "kebabcase",
};

export default class ClassPattern extends Rule<void, RuleOptions> {
	private pattern: RegExp;

	public constructor(options: RuleOptions) {
		super({ ...defaults, ...options });
		this.pattern = parsePattern(this.options.pattern);
	}

	public documentation(): RuleDocumentation {
		const pattern = describePattern(this.options.pattern);
		return {
			description: `For consistency all classes are required to match the pattern ${pattern}.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			if (event.key.toLowerCase() !== "class") {
				return;
			}

			const classes = new DOMTokenList(event.value, event.valueLocation);
			classes.forEach((cur: string, index: number) => {
				if (!cur.match(this.pattern)) {
					const location = classes.location(index);
					this.report(
						event.target,
						`Class "${cur}" does not match required pattern "${this.pattern}"`,
						location
					);
				}
			});
		});
	}
}
