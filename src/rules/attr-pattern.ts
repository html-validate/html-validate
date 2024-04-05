import { type HtmlElement } from "../dom";
import { type AttributeEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

interface RuleOptions {
	pattern: string | string[];
	ignoreForeign: boolean;
}

interface RuleContext {
	attr: string;
	pattern: string | string[];
}

export const DEFAULT_PATTERN = "[a-z0-9-:]+";

const defaults: RuleOptions = {
	pattern: DEFAULT_PATTERN,
	ignoreForeign: true,
};

function generateRegexp(pattern: string | string[]): RegExp {
	if (Array.isArray(pattern)) {
		/* eslint-disable-next-line security/detect-non-literal-regexp -- expected to be regexp */
		return new RegExp(`^(${pattern.join("|")})$`, "i");
	} else {
		/* eslint-disable-next-line security/detect-non-literal-regexp -- expected to be regexp  */
		return new RegExp(`^${pattern}$`, "i");
	}
}

function generateMessage(name: string, pattern: string | string[]): string {
	if (Array.isArray(pattern)) {
		const patterns = pattern.map((it) => `/${it}/`).join(", ");
		return `Attribute "${name}" should match one of [${patterns}]`;
	} else {
		return `Attribute "${name}" should match /${pattern}/`;
	}
}

function generateDescription(name: string, pattern: string | string[]): string {
	if (Array.isArray(pattern)) {
		return [
			`Attribute "${name}" should match one of the configured regular expressions:`,
			"",
			...pattern.map((it) => `- \`/${it}/\``),
		].join("\n");
	} else {
		return `Attribute "${name}" should match the regular expression \`/${pattern}/\``;
	}
}

export default class AttrPattern extends Rule<RuleContext, RuleOptions> {
	private pattern: RegExp;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.pattern = generateRegexp(this.options.pattern);
	}

	public static schema(): SchemaObject {
		return {
			pattern: {
				oneOf: [{ type: "array", items: { type: "string" }, minItems: 1 }, { type: "string" }],
			},
			ignoreForeign: {
				type: "boolean",
			},
		};
	}

	public documentation(context: RuleContext): RuleDocumentation {
		return {
			description: generateDescription(context.attr, context.pattern),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			if (this.isIgnored(event.target)) {
				return;
			}

			/* ignore case for dynamic attributes, the original attributes will be
			 * checked instead (this prevents duplicated errors for the same source
			 * attribute) */
			if (event.originalAttribute) {
				return;
			}

			if (this.pattern.test(event.key)) {
				return;
			}

			const message = generateMessage(event.key, this.options.pattern);
			const context: RuleContext = {
				attr: event.key,
				pattern: this.options.pattern,
			};
			this.report(event.target, message, event.keyLocation, context);
		});
	}

	protected isIgnored(node: HtmlElement): boolean {
		if (this.options.ignoreForeign) {
			return Boolean(node.meta?.foreign);
		} else {
			return false;
		}
	}
}
