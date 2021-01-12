import { sliceLocation } from "../context";
import { HtmlElement } from "../dom";
import { TagOpenEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

interface Options {
	allowMultipleH1: boolean;
}

const defaults: Options = {
	allowMultipleH1: false,
};

export default class HeadingLevel extends Rule<void, Options> {
	public constructor(options: Partial<Options>) {
		super({ ...defaults, ...options });
	}

	public documentation(): RuleDocumentation {
		return {
			description:
				"Validates heading level increments and order. Headings must start at h1 and can only increase one level at a time.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		let current = 0;
		let h1Count = 0;
		this.on("tag:open", (event: TagOpenEvent) => {
			/* ensure it is a heading */
			if (!this.isHeading(event.target)) return;

			/* extract heading level from tagName */
			const level = this.extractLevel(event.target);
			if (!level) return;

			/* do not allow multiple h1 */
			if (!this.options.allowMultipleH1 && level === 1) {
				if (h1Count >= 1) {
					const location = sliceLocation(event.location, 1);
					this.report(event.target, `Multiple h1 are not allowed`, location);
					return;
				}

				h1Count++;
			}

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
					this.report(event.target, `Initial heading level must be h${expected}`, location);
				}
			}

			current = level;
		});
	}

	private isHeading(node: HtmlElement): boolean {
		return Boolean(node.meta && !!node.meta.heading);
	}

	private extractLevel(node: HtmlElement): number | null {
		const match = node.tagName.match(/^[hH](\d)$/);
		return match ? parseInt(match[1], 10) : null;
	}
}
