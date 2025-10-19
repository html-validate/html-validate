import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class NoMultipleMain extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description: [
				"Only a single visible `<main>` element can be present at in a document at a time.",
				"",
				"Multiple `<main>` can be present in the DOM as long the others are hidden using the HTML5 `hidden` attribute.",
			].join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			const main = document.querySelectorAll("main").filter((cur) => !cur.hasAttribute("hidden"));
			main.shift(); /* ignore the first occurrence */

			/* report all other occurrences */
			for (const elem of main) {
				this.report(elem, "Multiple <main> elements present in document");
			}
		});
	}
}
