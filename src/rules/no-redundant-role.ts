import { DynamicValue } from "../dom";
import { type TagReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export interface RuleContext {
	tagName: string;
	role: string;
}

export default class NoRedundantRole extends Rule<RuleContext> {
	public documentation(context: RuleContext): RuleDocumentation {
		const { role, tagName } = context;
		return {
			description: `Using the \`${role}\` role is redundant as it is already implied by the \`<${tagName}>\` element.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:ready", (event: TagReadyEvent) => {
			const { target } = event;
			const role = target.getAttribute("role");

			/* ignore missing and dynamic values */
			if (!role?.value || role.value instanceof DynamicValue) {
				return;
			}

			/* ignore elements without metadata */
			const { meta } = target;
			if (!meta) {
				return;
			}

			/* ignore elements without implicit role */
			const implicitRole = meta.aria.implicitRole(target._adapter);
			if (!implicitRole) {
				return;
			}

			/* ignore elements with non-redundant roles */
			if (role.value !== implicitRole) {
				return;
			}

			/* report error */
			const context: RuleContext = {
				tagName: target.tagName,
				role: role.value,
			};
			this.report(
				event.target,
				`Redundant role "${role.value}" on <${target.tagName}>`,
				role.valueLocation,
				context,
			);
		});
	}
}
