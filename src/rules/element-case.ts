import { type HtmlElement } from "../dom";
import { type TagEndEvent, type TagStartEvent } from "../event";
import { type Location, sliceLocation } from "../location";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";
import { type CaseStyleName, CaseStyle } from "./helper/case-style";

interface RuleOptions {
	style: CaseStyleName | CaseStyleName[];
	ignoreForeign: boolean;
}

const defaults: RuleOptions = {
	style: "lowercase",
	ignoreForeign: true,
};

export default class ElementCase extends Rule<void, RuleOptions> {
	private style: CaseStyle;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.style = new CaseStyle(this.options.style, "element-case");
	}

	public static override readonly fixable = true;

	public static override schema(): SchemaObject {
		const styleEnum = ["lowercase", "uppercase", "pascalcase", "camelcase"];
		return {
			ignoreForeign: {
				type: "boolean",
			},
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
		if (target.implicit || (this.options.ignoreForeign && this.isForeign(target))) {
			return;
		}
		const location = sliceLocation(targetLocation, 1);
		const tagName = target.tagName.slice(-location.size);
		const letters = tagName.replaceAll(/[^a-z]+/gi, "");
		if (this.style.match(letters)) {
			return;
		}
		this.report({
			node: target,
			message: `Element "${tagName}" should be ${this.style.name}`,
			location,
			fix: this.style.createFixer(location, tagName),
		});
	}

	private validateMatchingCase(start: HtmlElement | null, end: HtmlElement | null): void {
		/* handle when elements have have missing start or end tag */
		if (!start || start.implicit || !end || !start.tagName || !end.tagName) {
			return;
		}

		/* only check case if the names are a lowercase match to each other or it
		 * will yield false positives when elements are closed in wrong order or
		 * otherwise mismatched */
		const location = sliceLocation(end.location, 1);
		const startName = start.tagName.slice(-start.location.size);
		const endName = end.tagName.slice(-location.size);
		if (startName.toLowerCase() !== endName.toLowerCase()) {
			return;
		}

		if (startName === endName) {
			return;
		}

		/* end.location includes the leading "/" so strip it to target just the tag name */
		this.report({
			node: start,
			message: "Start and end tag must not differ in casing",
			location: end.location,
			fix(fixer) {
				fixer.replaceText(location, startName);
			},
		});
	}

	private isForeign(node: HtmlElement): boolean {
		let current: HtmlElement | null = node;
		while (current) {
			if (current.meta?.foreign) {
				return true;
			}
			current = current.parent;
		}
		return false;
	}
}
