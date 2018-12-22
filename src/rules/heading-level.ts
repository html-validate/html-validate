import { HtmlElement } from "../dom";
import { TagOpenEvent } from "../event";
import { Rule } from "../rule";

class HeadingLevel extends Rule {
	setup(){
		let current = 0;
		this.on("tag:open", (event: TagOpenEvent) => {
			/* ensure it is a heading */
			if (!this.isHeading(event.target)) return;

			/* extract heading level from tagName */
			const level = this.extractLevel(event.target);
			if (!level) return;

			/* allow same level or decreasing to any level (e.g. from h4 to h2) */
			if (level <= current){
				current = level;
				return;
			}

			/* validate heading level was only incremented by one */
			const expected = current + 1;
			if (level !== expected){
				if (current > 0){
					this.report(event.target, `Heading level can only increase by one, expected h${expected}`);
				} else {
					this.report(event.target, `Initial heading level must be h${expected}`);
				}
			}

			current = level;
		});
	}

	isHeading(node: HtmlElement): boolean {
		return node.meta && !!node.meta.heading;
	}

	extractLevel(node: HtmlElement): number {
		const match = node.tagName.match(/^[hH](\d)$/);
		return match ? parseInt(match[1], 10) : null;
	}
}

module.exports = HeadingLevel;
