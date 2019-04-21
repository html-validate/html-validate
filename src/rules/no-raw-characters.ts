import { Location, sliceLocation } from "../context";
import { NodeType } from "../dom";
import { AttributeEvent, ElementReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

const textRegexp = /([<>]|&(?![a-zA-Z0-9#]+;))/g;
const attrRegexp = /([<>"'=`]|&(?![a-zA-Z0-9#]+;))/g;

const replacementTable: { [key: string]: string } = {
	'"': "&quot;",
	"&": "&amp;",
	"'": "&apos;",
	"<": "&lt;",
	"=": "&equals",
	">": "&gt;",
	"`": "&grave;",
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
				this.findRawChars(child.textContent, child.location, textRegexp);
			}
		});

		this.on("attr", (event: AttributeEvent) => {
			/* boolean attributes has no value so nothing to validate */
			if (!event.value) {
				return;
			}

			/* quoted attribute values can contain most symbols except the quotemark
			 * itself but unescaped quotemarks would cause a parsing error */
			if (event.quote) {
				return;
			}

			this.findRawChars(
				event.value.toString(),
				event.valueLocation,
				attrRegexp
			);
		});
	}

	/**
	 * Find raw special characters and report as errors.
	 */
	private findRawChars(text: string, location: Location, regexp: RegExp): void {
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
