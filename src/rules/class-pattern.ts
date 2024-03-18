import { DOMTokenList } from "../dom";
import { type AttributeEvent } from "../event";
import { type PatternName, describePattern, parsePattern } from "../pattern";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

interface RuleOptions {
	pattern: PatternName;
}

const defaults: RuleOptions = {
	pattern: "kebabcase",
};

export default class ClassPattern extends Rule<void, RuleOptions> {
	private pattern: RegExp;
	private description: string;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.pattern = parsePattern(this.options.pattern);
		this.description = describePattern(this.options.pattern);
	}

	public static schema(): SchemaObject {
		return {
			pattern: {
				type: "string",
			},
		};
	}

	public documentation(): RuleDocumentation {
		const pattern = describePattern(this.options.pattern);
		return {
			description: `For consistency all classes are required to match the pattern ${pattern}.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		const { description } = this;
		this.on("attr", (event: AttributeEvent) => {
			if (event.key.toLowerCase() !== "class") {
				return;
			}

			const classes = new DOMTokenList(event.value, event.valueLocation);
			classes.forEach((cur: string, index: number) => {
				if (!cur.match(this.pattern)) {
					const location = classes.location(index);
					const message = `Class "${cur}" does not match required pattern ${description}`;
					this.report(event.target, message, location);
				}
			});
		});
	}
}
