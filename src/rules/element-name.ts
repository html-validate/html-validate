import { sliceLocation } from "../context";
import { type TagStartEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

interface Context {
	tagName: string;
	pattern: string;
	blacklist: string[];
}

interface RuleOptions {
	pattern: string;
	whitelist: string[];
	blacklist: string[];
}

const defaults: RuleOptions = {
	pattern: "^[a-z][a-z0-9\\-._]*-[a-z0-9\\-._]*$",
	whitelist: [],
	blacklist: [],
};

export default class ElementName extends Rule<Context, RuleOptions> {
	private pattern: RegExp;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });

		/* eslint-disable-next-line security/detect-non-literal-regexp -- expected to be a regexp */
		this.pattern = new RegExp(this.options.pattern);
	}

	public static override schema(): SchemaObject {
		return {
			blacklist: {
				items: {
					type: "string",
				},
				type: "array",
			},
			pattern: {
				type: "string",
			},
			whitelist: {
				items: {
					type: "string",
				},
				type: "array",
			},
		};
	}

	public override documentation(context: Context): RuleDocumentation {
		return {
			description: this.documentationMessages(context).join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	private documentationMessages(context: Context): string[] {
		if (context.blacklist.includes(context.tagName)) {
			return [
				`<${context.tagName}> is blacklisted by the project configuration.`,
				"",
				"The following names are blacklisted:",
				...context.blacklist.map((cur) => `- ${cur}`),
			];
		}

		if (context.pattern !== defaults.pattern) {
			return [
				`<${context.tagName}> is not a valid element name. This project is configured to only allow names matching the following regular expression:`,
				"",
				`- \`${context.pattern}\``,
			];
		}

		return [
			`<${context.tagName}> is not a valid element name. If this is a custom element HTML requires the name to follow these rules:`,
			"",
			"- The name must begin with `a-z`",
			"- The name must include a hyphen `-`",
			"- It may include alphanumerical characters `a-z0-9` or hyphens `-`, dots `.` or underscores `_`.",
		];
	}

	public setup(): void {
		const xmlns = /^(.+):.+$/;
		this.on("tag:start", (event: TagStartEvent) => {
			const target = event.target;
			const tagName = target.tagName;
			const location = sliceLocation(event.location, 1);
			const context: Context = {
				tagName,
				pattern: this.options.pattern,
				blacklist: this.options.blacklist,
			};

			/* check if element is blacklisted */
			if (this.options.blacklist.includes(tagName)) {
				this.report(target, `<${tagName}> element is blacklisted`, location, context);
			}

			/* assume that an element with meta has valid name as it is a builtin
			 * element */
			if (target.meta) {
				return;
			}

			/* ignore elements in xml namespaces, they should be validated against a
			 * DTD instead */
			if (xmlns.exec(tagName)) {
				return;
			}

			/* check if element is whitelisted */
			if (this.options.whitelist.includes(tagName)) {
				return;
			}

			if (!tagName.match(this.pattern)) {
				this.report(target, `<${tagName}> is not a valid element name`, location, context);
			}
		});
	}
}
