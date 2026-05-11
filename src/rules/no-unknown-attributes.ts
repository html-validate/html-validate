import { type AttributeEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export interface RuleContext {
	tagName: string;
	attr: string;
}

const skipPatterns: RegExp[] = [
	/^data-/i,
	/^aria-/i,
	/^on[a-z]/i,
	/^xml(ns)?:/i,
	/^:/,
	/^@/,
	/^ng-/i,
	/^v-/i,
	/^x-/i,
	/^\[/,
];

function isKnownDynamicAttr(attr: string): boolean {
	return skipPatterns.some((pattern) => pattern.test(attr));
}

export default class NoUnknownAttributes extends Rule<RuleContext> {
	public override documentation(context: RuleContext): RuleDocumentation {
		return {
			description: `The \`${context.attr}\` attribute is not a known attribute on \`<${context.tagName}>\`.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			const node = event.target;
			const meta = node.meta;
			const attr = event.key.toLowerCase();

			/* cannot validate without element metadata */
			if (meta === null) {
				return;
			}

			/* attribute is known in element metadata (includes global attributes) */
			if (attr in meta.attributes) {
				return;
			}

			/* skip attributes matching known dynamic or framework patterns */
			if (isKnownDynamicAttr(attr)) {
				return;
			}

			this.report({
				node,
				message: `Attribute "${event.key}" is not allowed on <${node.tagName}> element`,
				location: event.keyLocation,
				context: {
					tagName: node.tagName,
					attr: event.key,
				},
			});
		});
	}
}
