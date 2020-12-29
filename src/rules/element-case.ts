import { Location, sliceLocation } from "../context";
import { HtmlElement } from "../dom";
import { TagCloseEvent, TagOpenEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";
import { CaseStyle, CaseStyleName } from "./helper/case-style";

interface RuleOptions {
	style: CaseStyleName;
}

const defaults: RuleOptions = {
	style: "lowercase",
};

export default class ElementCase extends Rule<void, RuleOptions> {
	private style: CaseStyle;

	public constructor(options: RuleOptions) {
		super({ ...defaults, ...options });
		this.style = new CaseStyle(this.options.style, "element-case");
	}

	public documentation(): RuleDocumentation {
		return {
			description: `Element tagname must be ${this.options.style}.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:open", (event: TagOpenEvent) => {
			const { target, location } = event;
			this.validateCase(target, location);
		});
		this.on("tag:close", (event: TagCloseEvent) => {
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

	private validateMatchingCase(start: HtmlElement, end: HtmlElement): void {
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
