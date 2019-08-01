import { DynamicValue } from "../dom";
import { AttributeEvent } from "../event";
import { describePattern, parsePattern } from "../pattern";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

const defaults = {
	pattern: "kebabcase",
};

class IdPattern extends Rule {
	private pattern: RegExp;

	constructor(options: object) {
		super(Object.assign({}, defaults, options));
		this.pattern = parsePattern(this.options.pattern);
	}

	public documentation(): RuleDocumentation {
		const pattern = describePattern(this.options.pattern);
		return {
			description: `For consistency all IDs are required to match the pattern ${pattern}.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			if (event.key.toLowerCase() !== "id") {
				return;
			}

			/* consider dynamic value as always matching the pattern */
			if (event.value instanceof DynamicValue) {
				return;
			}

			if (!event.value.match(this.pattern)) {
				this.report(
					event.target,
					`ID "${event.value}" does not match required pattern "${this.pattern}"`,
					event.valueLocation
				);
			}
		});
	}
}

module.exports = IdPattern;
