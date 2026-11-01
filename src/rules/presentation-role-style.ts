import { type HtmlElement, DOMTokenList, DynamicValue } from "../dom";
import { type AttributeEvent } from "../event";
import { type Location } from "../location";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

type Role = "none" | "presentation";

export interface RuleContext {
	/** The role used in the markup */
	readonly used: Role;
	/** The role the rule is configured to prefer */
	readonly prefer: Role;
}

interface RuleOptions {
	readonly prefer: Role;
}

const defaults: RuleOptions = {
	prefer: "none",
};

const synonym = {
	none: "presentation",
	presentation: "none",
} as const;

/** True if the list consists of only `none` and `presentation` and uses both. */
function isOnlyBothSynonyms(roles: DOMTokenList): boolean {
	const tokens = Array.from(roles, (it) => it.toLowerCase());
	const onlySynonyms = tokens.every((it) => it === "none" || it === "presentation");
	return onlySynonyms && tokens.includes("none") && tokens.includes("presentation");
}

export default class PresentationRoleStyle extends Rule<RuleContext, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public static override readonly fixable = true;

	public static override schema(): SchemaObject {
		return {
			prefer: {
				enum: ["none", "presentation"],
				type: "string",
			},
		};
	}

	public override documentation(context: RuleContext): RuleDocumentation {
		const { used, prefer } = context;
		return {
			description: [
				`Prefer to use \`role="${prefer}"\` instead of \`role="${used}"\`.`,
				"",
				`\`role="${used}"\` is a synonym for \`role="${prefer}"\`.`,
				`The current configuration requires \`role="${prefer}"\` to be used.`,
			].join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		const { prefer } = this.options;
		const discouraged = synonym[prefer]; // the role we do not want to use

		this.on("attr", (event: AttributeEvent) => {
			if (event.key.toLowerCase() !== "role") {
				return;
			}

			/* ignore missing and dynamic values */
			const { value } = event;
			if (!value || value instanceof DynamicValue) {
				return;
			}

			/* aliased attributes have no value location, the tokens cannot be located or fixed */
			const { valueLocation } = event;
			if (!valueLocation) {
				return;
			}

			const roles = new DOMTokenList(value, valueLocation);

			/* using both synonyms at once is redundant, the whole value is replaced */
			if (isOnlyBothSynonyms(roles)) {
				this.reportError(event.target, valueLocation);
				return;
			}

			/* otherwise each discouraged token is replaced individually */
			for (const { item, location } of roles.iterator()) {
				if (item.toLowerCase() === discouraged) {
					this.reportError(event.target, location);
				}
			}
		});
	}

	private reportError(node: HtmlElement, location: Location): void {
		const { prefer } = this.options;
		const discouraged = synonym[prefer];
		this.report({
			node,
			message: `Prefer to use role="${prefer}" instead of role="${discouraged}"`,
			location,
			context: { used: discouraged, prefer },
			fix(fixer) {
				fixer.replaceText(location, prefer);
			},
		});
	}
}
