import { Location, sliceLocation } from "../context";
import { NodeType } from "../dom";
import { ElementReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

const regexp = /([<>]|&(?![a-zA-Z0-9#]+;))/g;
const replacementTable: { [key: string]: string } = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
};

class NoRawCharacters extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: `The characters \`<\`, \`>\` and \`&\` hold special meaning in HTML and must be escaped using a character reference (html entity).`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup() {
		this.on("element:ready", (event: ElementReadyEvent) => {
			const node = event.target;

			/* only iterate over direct descendants */
			for (const child of node.childNodes) {
				if (child.nodeType !== NodeType.TEXT_NODE) {
					continue;
				}
				this.findRawChars(child.textContent, child.location);
			}
		});
	}

	/**
	 * Find raw special characters and report as errors.
	 */
	private findRawChars(text: string, location: Location): void {
		let match;
		do {
			match = regexp.exec(text);
			if (match) {
				const char = match[0];
				const replacement = replacementTable[char];
				const charLocation = sliceLocation(
					location,
					match.index,
					match.index + 1
				);
				this.report(
					null,
					`Raw "${char}" must be encoded as "${replacement}"`,
					charLocation
				);
			}
		} while (match);
	}
}

module.exports = NoRawCharacters;
