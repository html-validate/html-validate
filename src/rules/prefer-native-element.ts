import { type Location } from "../context";
import { DynamicValue } from "../dom";
import { type AttributeEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

interface RuleContext {
	role: string;
	replacement: string;
}

interface RuleOptions {
	mapping: Record<string, string>;
	include: string[] | null;
	exclude: string[] | null;
}

const defaults: RuleOptions = {
	mapping: {
		article: "article",
		banner: "header",
		button: "button",
		cell: "td",
		checkbox: "input",
		complementary: "aside",
		contentinfo: "footer",
		figure: "figure",
		form: "form",
		heading: "hN",
		input: "input",
		link: "a",
		list: "ul",
		listbox: "select",
		listitem: "li",
		main: "main",
		navigation: "nav",
		progressbar: "progress",
		radio: "input",
		region: "section",
		table: "table",
		textbox: "textarea",
	},
	include: null,
	exclude: null,
};

export default class PreferNativeElement extends Rule<RuleContext, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public static schema(): SchemaObject {
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
			mapping: {
				type: "object",
			},
		};
	}

	public documentation(context: RuleContext): RuleDocumentation {
		return {
			description: `Instead of using the WAI-ARIA role "${context.role}" prefer to use the native <${context.replacement}> element.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		const { mapping } = this.options;
		this.on("attr", (event: AttributeEvent) => {
			/* ignore non-role attributes */
			if (event.key.toLowerCase() !== "role") {
				return;
			}

			/* ignore missing and dynamic values */
			if (!event.value || event.value instanceof DynamicValue) {
				return;
			}

			/* ignore roles configured to be ignored */
			const role = event.value.toLowerCase();
			if (this.isIgnored(role)) {
				return;
			}

			/* dont report when the element is already of the right type but has a
			 * redundant role, such as <main role="main"> */
			const replacement = mapping[role];
			if (event.target.is(replacement)) {
				return;
			}

			/* report error */
			const context: RuleContext = { role, replacement };
			const location = this.getLocation(event);
			this.report(
				event.target,
				`Prefer to use the native <${replacement}> element`,
				location,
				context,
			);
		});
	}

	private isIgnored(role: string): boolean {
		const { mapping } = this.options;

		/* ignore roles not mapped to native elements */
		const replacement = mapping[role];
		if (!replacement) {
			return true;
		}

		return this.isKeywordIgnored(role);
	}

	private getLocation(event: AttributeEvent): Location | null {
		const begin = event.location;
		const end = event.valueLocation!; // eslint-disable-line @typescript-eslint/no-non-null-assertion -- technical debt, valueLocation will always be set when a value is provided
		const quote = event.quote ? 1 : 0;
		const size = end.offset + end.size - begin.offset + quote;
		return {
			filename: begin.filename,
			line: begin.line,
			column: begin.column,
			offset: begin.offset,
			size,
		};
	}
}
