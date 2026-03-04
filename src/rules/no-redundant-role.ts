import { DynamicValue } from "../dom";
import { type TagReadyEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";
import { type IncludeExcludeOptions } from "./helper";

export interface RuleContext {
	tagName: string;
	role: string;
}

type RuleOptions = IncludeExcludeOptions;

const defaults: RuleOptions = {
	include: null,
	exclude: null,
};

export default class NoRedundantRole extends Rule<RuleContext, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public override documentation(context: RuleContext): RuleDocumentation {
		const { role, tagName } = context;
		return {
			description: `Using the \`${role}\` role is redundant as it is already implied by the \`<${tagName}>\` element.`,
			url: ruleDocumentationUrl(__filename),
		};
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

			/* ignore roles configured to be ignored */
			if (this.isKeywordIgnored(role.value)) {
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
