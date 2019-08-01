import { Location, sliceLocation } from "../context";
import { NodeType } from "../dom";
import { AttributeEvent, ElementReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

const entities = require("../../elements/entities.json");
const regexp = /&([a-z0-9]+|#x?[0-9a-f]+);/gi;

class UnknownCharReference extends Rule<string> {
	public documentation(context: string): RuleDocumentation {
		return {
			description: `HTML defines a set of valid character references but ${context ||
				"this"} is not a valid one.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("element:ready", (event: ElementReadyEvent) => {
			const node = event.target;

			/* only iterate over direct descendants */
			for (const child of node.childNodes) {
				if (child.nodeType !== NodeType.TEXT_NODE) {
					continue;
				}
				this.findCharacterReferences(child.textContent, child.location);
			}
		});

		this.on("attr", (event: AttributeEvent) => {
			/* boolean attributes has no value so nothing to validate */
			if (!event.value) {
				return;
			}

			this.findCharacterReferences(event.value.toString(), event.valueLocation);
		});
	}

	private findCharacterReferences(text: string, location: Location): void {
		let match;
		do {
			match = regexp.exec(text);
			if (match) {
				const entity = match[0];

				/* assume numeric entities are valid for now */
				if (entity.startsWith("&#")) {
					continue;
				}

				/* ignore if this is a known character reference name */
				if (entities.includes(entity)) {
					continue;
				}

				const entityLocation = sliceLocation(
					location,
					match.index,
					match.index + entity.length
				);
				this.report(
					null,
					`Unrecognized character reference "${entity}"`,
					entityLocation,
					entity
				);
			}
		} while (match);
	}
}

module.exports = UnknownCharReference;
