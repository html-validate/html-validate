import { type Location, sliceLocation } from "../context";
import { type HtmlElement } from "../dom";
import { type TagEndEvent, type TagStartEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";
import { type CaseStyleName, CaseStyle } from "./helper/case-style";

interface RuleOptions {
	style: CaseStyleName | CaseStyleName[];
}

const defaults: RuleOptions = {
	style: "lowercase",
};

export default class ElementCase extends Rule<void, RuleOptions> {
	private style: CaseStyle;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.style = new CaseStyle(this.options.style, "element-case");
	}

	public static override schema(): SchemaObject {
		const styleEnum = ["lowercase", "uppercase", "pascalcase", "camelcase"];
		return {
			style: {
				anyOf: [
					{
						enum: styleEnum,
						type: "string",
					},
					{
						items: {
							enum: styleEnum,
							type: "string",
						},
						type: "array",
					},
				],
			},
		};
	}

	public override documentation(): RuleDocumentation {
		const { style } = this.options;
		return {
			description: Array.isArray(style)
				? [`Element tagname must be in one of:`, "", ...style.map((it) => `- ${it}`)].join("\n")
				: `Element tagname must be in ${style}.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:start", (event: TagStartEvent) => {
			const { target, location } = event;
			this.validateCase(target, location);
		});
		this.on("tag:end", (event: TagEndEvent) => {
			const { target, previous } = event;
			this.validateMatchingCase(previous, target);
		});
	}

	private validateCase(target: HtmlElement, targetLocation: Location): void {
		const letters = target.tagName.replace(/[^a-z]+/gi, "");
		if (!this.style.match(letters)) {
			const location = sliceLocation(targetLocation, 1);
			this.report(target, `Element "${target.tagName}" should be ${this.style.name}`, location);
		}
	}

	private validateMatchingCase(start: HtmlElement | null, end: HtmlElement | null): void {
		/* handle when elements have have missing start or end tag */
		if (!start || !end || !start.tagName || !end.tagName) {
			return;
		}

		/* only check case if the names are a lowercase match to each other or it
		 * will yield false positives when elements are closed in wrong order or
		 * otherwise mismatched */
		if (start.tagName.toLowerCase() !== end.tagName.toLowerCase()) {
			return;
		}

		if (start.tagName !== end.tagName) {
			this.report(start, "Start and end tag must not differ in casing", end.location);
		}
	}
}
