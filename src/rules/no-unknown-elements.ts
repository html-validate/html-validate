import { type TagStartEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";
import { type IncludeExcludeOptions, keywordPatternMatcher } from "./helper";

type RuleContext = string;
type RuleOptions = IncludeExcludeOptions;

const defaults: RuleOptions = {
	include: null,
	exclude: null,
};

export default class NoUnknownElements extends Rule<RuleContext, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public static override schema(): SchemaObject {
		return {
			exclude: {
				anyOf: [
					{
						items: {
							type: "string",
						},
						type: "array",
					},
					{
						type: "null",
					},
				],
			},
			include: {
				anyOf: [
					{
						items: {
							type: "string",
						},
						type: "array",
					},
					{
						type: "null",
					},
				],
			},
		};
	}

	public override documentation(context: RuleContext): RuleDocumentation {
		const element = context ? ` <${context}>` : "";
		return {
			description: `An unknown element${element} was used. If this is a Custom Element you need to supply element metadata for it.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:start", (event: TagStartEvent) => {
			const node = event.target;
			if (node.meta) {
				return;
			}
			if (this.isKeywordIgnored(node.tagName, keywordPatternMatcher)) {
				return;
			}
			this.report(node, `Unknown element <${node.tagName}>`, null, node.tagName);
		});
	}
}
