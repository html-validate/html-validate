import { Location, sliceLocation } from "../context";
import { HtmlElement, NodeType } from "../dom";
import { AttributeEvent, ElementReadyEvent } from "../event";
import { Rule, RuleDocumentation, SchemaObject, ruleDocumentationUrl } from "../rule";
import entities from "../elements/entities.json";

export interface RuleContext {
	entity: string;
}

interface RuleOptions {
	ignoreCase: boolean;
}

interface EntityMatch {
	/** original regex match object */
	match: RegExpMatchArray;
	/** normalized character reference */
	entity: string;
	/** raw/original character reference (that is, exactly as the user entered it) */
	raw: string;
}

const defaults: RuleOptions = {
	ignoreCase: false,
};

const regexp = /&([a-z0-9]+|#x?[0-9a-f]+);/gi;
const lowercaseEntities = entities.map((it) => it.toLowerCase());

export default class UnknownCharReference extends Rule<RuleContext, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public static schema(): SchemaObject {
		return {
			ignoreCase: {
				type: "boolean",
			},
		};
	}

	public documentation(context?: RuleContext): RuleDocumentation {
		const value = context ? context.entity : "this";
		return {
			description: `HTML defines a set of valid character references but ${value} is not a valid one.`,
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
				this.findCharacterReferences(node, child.textContent, child.location);
			}
		});

		this.on("attr", (event: AttributeEvent) => {
			/* boolean attributes has no value so nothing to validate */
			if (!event.value) {
				return;
			}

			this.findCharacterReferences(event.target, event.value.toString(), event.valueLocation);
		});
	}

	private get entities(): string[] {
		if (this.options.ignoreCase) {
			return lowercaseEntities;
		} else {
			return entities;
		}
	}

	private findCharacterReferences(
		node: HtmlElement,
		text: string,
		location: Location | null
	): void {
		for (const { match, entity, raw } of this.getMatches(text)) {
			/* assume numeric entities are valid for now */
			if (entity.startsWith("&#")) {
				continue;
			}

			/* ignore if this is a known character reference name */
			if (this.entities.includes(entity)) {
				continue;
			}

			const index = match.index ?? 0;
			const entityLocation = sliceLocation(location, index, index + entity.length);
			const message = `Unrecognized character reference "{{ entity }}"`;
			const context: RuleContext = {
				entity: raw,
			};
			this.report(node, message, entityLocation, context);
		}
	}

	private *getMatches(text: string): IterableIterator<EntityMatch> {
		let match: RegExpMatchArray | null;
		do {
			match = regexp.exec(text);
			if (match) {
				const entity = match[0];
				if (this.options.ignoreCase) {
					yield { match, entity: entity.toLowerCase(), raw: entity };
				} else {
					yield { match, entity, raw: entity };
				}
			}
		} while (match);
	}
}
