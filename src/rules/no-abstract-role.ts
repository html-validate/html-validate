import { DOMTokenList, DynamicValue } from "../dom";
import { type AttributeEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

interface RuleContext {
	role: string;
}

const abstractRoles = [
	"command",
	"composite",
	"input",
	"landmark",
	"range",
	"roletype",
	"section",
	"sectionhead",
	"select",
	"structure",
	"widget",
	"window",
];

function isRelevant(event: AttributeEvent): boolean {
	return event.key === "role";
}

export default class NoAbstractRole extends Rule<RuleContext> {
	public override documentation(context: RuleContext): RuleDocumentation {
		return {
			description: [
				`Role \`"${context.role}"\` is abstract and must not be used.`,
				"",
				"WAI-ARIA defines a list of [abstract roles](https://www.w3.org/TR/wai-aria-1.2/#abstract_roles) which cannot be used by authors:",
				"",
				...abstractRoles.map((it) => `- \`"${it}"\``),
				"",
				`Use one of the defined subclass roles for \`"${context.role}"\` instead.`,
			].join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", isRelevant, (event: AttributeEvent) => {
			const roles = event.value;

			/* ignore missing value and dynamic values */
			if (!roles || roles instanceof DynamicValue) {
				return;
			}

			const tokens = new DOMTokenList(roles, event.valueLocation);
			for (const { item: role, location } of tokens.iterator()) {
				/* ignore roles which are not abstract */
				if (!abstractRoles.includes(role)) {
					continue;
				}

				this.report({
					node: event.target,
					message: `Role "{{ role }}" is abstract and must not be used`,
					location,
					context: {
						role,
					},
				});
			}
		});
	}
}
