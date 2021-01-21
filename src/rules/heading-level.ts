import { sliceLocation } from "../context";
import { HtmlElement } from "../dom";
import { TagStartEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

interface Options {
	allowMultipleH1: boolean;
}

const defaults: Options = {
	allowMultipleH1: false,
};

function isRelevant(event: TagStartEvent): boolean {
	const node = event.target;
	return Boolean(node.meta && !!node.meta.heading);
}

function extractLevel(node: HtmlElement): number | null {
	const match = node.tagName.match(/^[hH](\d)$/);
	return match ? parseInt(match[1], 10) : null;
}

export default class HeadingLevel extends Rule<void, Options> {
	public constructor(options: Partial<Options>) {
		super({ ...defaults, ...options });
	}

	public documentation(): RuleDocumentation {
		const text: string[] = [];
		text.push("Headings must start at <h1> and can only increase one level at a time.");
		text.push("The headings should form a table of contents and make sense on its own.");
		if (!this.options.allowMultipleH1) {
			text.push("");
			text.push(
				"Under the current configuration only a single <h1> can be present at a time in the document."
			);
		}
		return {
			description: text.join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		let current = 0;
		let h1Count = 0;
		this.on("tag:start", isRelevant, (event: TagStartEvent) => {
			/* extract heading level from tagName */
			const level = extractLevel(event.target);
			if (!level) return;

			/* do not allow multiple h1 */
			if (!this.options.allowMultipleH1 && level === 1) {
				if (h1Count >= 1) {
					const location = sliceLocation(event.location, 1);
					this.report(event.target, `Multiple <h1> are not allowed`, location);
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
					const msg = `Heading level can only increase by one, expected <h${expected}> but got <h${level}>`;
					this.report(event.target, msg, location);
				} else {
					const msg = `Initial heading level must be <h${expected}> but got <h${level}>`;
					this.report(event.target, msg, location);
				}
			}

			current = level;
		});
	}
}
