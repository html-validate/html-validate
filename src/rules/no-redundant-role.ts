import { DynamicValue } from "../dom";
import { type TagReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export interface RuleContext {
	tagName: string;
	role: string;
}

const mapping: Record<string, string[]> = {
	article: ["article"],
	header: ["banner"],
	button: ["button"],
	td: ["cell"],
	input: ["checkbox", "radio", "input"],
	aside: ["complementary"],
	footer: ["contentinfo"],
	figure: ["figure"],
	form: ["form"],
	h1: ["heading"],
	h2: ["heading"],
	h3: ["heading"],
	h4: ["heading"],
	h5: ["heading"],
	h6: ["heading"],
	a: ["link"],
	ul: ["list"],
	select: ["listbox"],
	li: ["listitem"],
	main: ["main"],
	nav: ["navigation"],
	progress: ["progressbar"],
	section: ["region"],
	table: ["table"],
	textarea: ["textbox"],
};

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

			/* ignore elements without known redundant roles */
			const redundant = mapping[target.tagName];
			if (!redundant) {
				return;
			}

			/* ignore elements with non-redundant roles */
			if (!redundant.includes(role.value)) {
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
				context
			);
		});
	}
}
