import { DOMTokenList } from "../dom";
import { type TagReadyEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

interface RuleOptions {
	preferred?: string;
}

interface RuleContextMissing {
	kind: "missing";
}

interface RuleContextOff {
	kind: "off";
}

interface RuleContextPreferredMismatch {
	kind: "preferred-mismatch";
	value: string;
	preferred: string;
}

export type RuleContext = RuleContextMissing | RuleContextOff | RuleContextPreferredMismatch;

const defaults: RuleOptions = {
	preferred: undefined,
};

function isPasswordInput(event: TagReadyEvent): boolean {
	const { target } = event;
	if (!target.is("input")) {
		return false;
	}
	const type = target.getAttribute("type");
	return type?.value?.toString().toLowerCase() === "password";
}

function isGroupingToken(token: string): boolean {
	return token.startsWith("section-") || token === "shipping" || token === "billing";
}

export default class AutocompletePassword extends Rule<RuleContext, RuleOptions> {
	private readonly preferred?: string;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.preferred = options.preferred?.toLowerCase();
	}

	public static override schema(): SchemaObject {
		return {
			preferred: {
				type: "string",
			},
		};
	}

	public override documentation(context: RuleContext): RuleDocumentation {
		const url = ruleDocumentationUrl(__filename);
		switch (context.kind) {
			case "preferred-mismatch":
				return {
					description: [
						`\`<input type="password">\` should use \`autocomplete="${context.preferred}"\`.`,
						"",
						`The configured preferred autocomplete value is \`"${context.preferred}"\` but the element uses \`"${context.value}"\`.`,
					].join("\n"),
					url,
				};

			case "off":
			case "missing":
			default: {
				const error =
					context.kind === "off"
						? '`<input type="password">` should not use `autocomplete="off"`.'
						: '`<input type="password">` must have the `autocomplete` attribute.';

				return {
					description: [
						error,
						"",
						"Browsers and password managers often ignore the absence of autocomplete and autofill password fields anyway, which can lead to unexpected behavior where users unknowingly submit autofilled passwords for unrelated fields.",
						"",
						"Use one of the following values:",
						"",
						'- `autocomplete="new-password"` for password creation forms',
						'- `autocomplete="current-password"` for login forms',
					].join("\n"),
					url,
				};
			}
		}
	}

	public setup(): void {
		this.on("tag:ready", isPasswordInput, (event: TagReadyEvent) => {
			const { preferred } = this;
			const { target } = event;
			const autocomplete = target.getAttribute("autocomplete");

			/* yield error if autocomplete is missing */
			if (!autocomplete) {
				const context: RuleContext = { kind: "missing" };
				this.report({
					node: target,
					message: '<input type="password"> is missing required "autocomplete" attribute',
					location: target.location,
					context,
				});
				return;
			}

			/* ignore when autocomplete is dynamic or the value is omitted (other rules handle invalid autocomplete values) */
			if (autocomplete.isDynamic || !autocomplete.value) {
				return;
			}

			/* extract the first non-grouping token from the autocomplete value */
			const raw = autocomplete.value.toString().toLowerCase();
			const tokens = new DOMTokenList(raw, autocomplete.valueLocation);
			const index = tokens.findIndex((token) => !isGroupingToken(token));
			const value = tokens.item(index);
			const location = tokens.location(index);

			/* no non-grouping token found, ignore (other rules handle invalid autocomplete values) */
			if (!value) {
				return;
			}

			/* yield error when autocomplete="off" or contains "off" as the non-grouping token */
			if (value === "off") {
				const context: RuleContext = { kind: "off" };
				this.report({
					node: target,
					message: '<input type="password"> should not use autocomplete="off"',
					/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- location must be present if value is */
					location: location!,
					context,
				});
				return;
			}

			/* if a preferred value is configured, yield error if it doesn't match the actual value */
			if (preferred) {
				if (value !== preferred) {
					const context: RuleContext = {
						kind: "preferred-mismatch",
						value,
						preferred,
					};
					this.report({
						node: target,
						message: `<input type="password"> should use autocomplete="${preferred}"`,
						/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- location must be present if value is */
						location: location!,
						context,
					});
				}
			}
		});
	}
}
