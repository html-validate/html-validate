import { sliceLocation } from "../context";
import { HtmlElement } from "../dom";
import { TagOpenEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

export default class HeadingLevel extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"Validates heading level increments and order. Headings must start at h1 and can only increase one level at a time.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		let current = 0;
		this.on("tag:open", (event: TagOpenEvent) => {
			/* ensure it is a heading */
			if (!this.isHeading(event.target)) return;

			/* extract heading level from tagName */
			const level = this.extractLevel(event.target);
			if (!level) return;

			/* allow same level or decreasing to any level (e.g. from h4 to h2) */
			if (level <= current) {
				current = level;
				return;
			}

			/* validate heading level was only incremented by one */
			const expected = current + 1;
			if (level !== expected) {
				const location = sliceLocation(event.location, 1);
				if (current > 0) {
					this.report(
						event.target,
						`Heading level can only increase by one, expected h${expected}`,
						location
					);
				} else {
					this.report(
						event.target,
						`Initial heading level must be h${expected}`,
						location
					);
				}
			}

			current = level;
		});
	}

	private isHeading(node: HtmlElement): boolean {
		return node.meta && !!node.meta.heading;
	}

	private extractLevel(node: HtmlElement): number {
		const match = node.tagName.match(/^[hH](\d)$/);
		return match ? parseInt(match[1], 10) : null;
	}
}
