import { type AttributeEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";
import { isPatternAttribute } from "./helper";

export interface RuleContext {
	tagName: string;
	attr: string;
}

const skipPatterns: RegExp[] = [/^:/, /^@/, /^ng-/i, /^v-/i, /^x-/i, /^\[/, /^#/];

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

			/* cannot validate without element metadata */
			if (meta === null) {
				return;
			}

			/* attribute is known in element metadata (includes global attributes) */
			const attr = event.key.toLowerCase();
			if (Object.hasOwn(meta.attributes, attr)) {
				return;
			}

			/* attribute matches a dynamic pattern (e.g. data-*, aria-*, on*) */
			if (isPatternAttribute(attr, meta.patternAttributes)) {
				return;
			}

			/* skip attributes matching known framework patterns */
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
