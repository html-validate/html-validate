import { DOMTokenList, DynamicValue } from "../dom";
import { type AttributeEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

interface RuleContext {
	role: string;
}

const ariaSpecificationUrl = {
	"1.2": "https://www.w3.org/TR/wai-aria-1.2/#abstract_roles",
	"1.3": "https://www.w3.org/TR/wai-aria-1.3/#abstract_roles",
	latest: "https://w3c.github.io/aria/#abstract_roles",
} as const;

function isRelevant(event: AttributeEvent): boolean {
	return event.key === "role";
}

export default class NoAbstractRole extends Rule<RuleContext> {
	public override documentation(context: RuleContext): RuleDocumentation {
		const ariaVersion = this.getAriaVersion();
		const abstractRoles = this.getAriaRoles((role) => role.category === "abstract");
		const url = ariaSpecificationUrl[ariaVersion];
		return {
			description: [
				`Role \`"${context.role}"\` is abstract and must not be used.`,
				"",
				`The configured WAI-ARIA version (${ariaVersion}) defines a list of [abstract roles](${url}) which cannot be used by authors:`,
				"",
				...Array.from(abstractRoles, ({ role }) => `- \`"${role}"\``),
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
				const roleData = this.getAriaRoleData(role);
				if (roleData?.category !== "abstract") {
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
