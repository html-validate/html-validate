import { Location, sliceLocation } from "../context";
import { HtmlElement, NodeType } from "../dom";
import { AttributeEvent, ElementReadyEvent } from "../event";
import { Rule, RuleDocumentation, SchemaObject, ruleDocumentationUrl } from "../rule";
import entities from "../elements/entities.json";

export interface RuleContext {
	entity: string;
	terminated: boolean;
}

interface RuleOptions {
	ignoreCase: boolean;
	requireSemicolon: boolean;
}

interface EntityMatch {
	/** original regex match object */
	match: RegExpMatchArray;
	/** normalized character reference */
	entity: string;
	/** raw/original character reference (that is, exactly as the user entered it) */
	raw: string;
	/** `true` if the character reference was terminated with a `;` */
	terminated: boolean;
}

const defaults: RuleOptions = {
	ignoreCase: false,
	requireSemicolon: true,
};

const regexp = /&(?:[a-z0-9]+|#x?[0-9a-f]+)(;|[^a-z0-9]|$)/gi;
const lowercaseEntities = entities.map((it) => it.toLowerCase());

function isNumerical(entity: string): boolean {
	return entity.startsWith("&#");
}

function getLocation(
	location: Location | null,
	entity: string,
	match: RegExpMatchArray
): Location | null {
	/* istanbul ignore next: never happens in practive */
	const index = match.index ?? 0;
	return sliceLocation(location, index, index + entity.length);
}

function getDescription(context: RuleContext | undefined, options: RuleOptions): string {
	const url = "https://html.spec.whatwg.org/multipage/named-characters.html";
	let message: string;
	if (context) {
		if (context.terminated) {
			message = `Unrecognized character reference \`${context.entity}\`.`;
		} else {
			message = `Character reference \`${context.entity}\` must be terminated by a semicolon.`;
		}
	} else {
		message = `Unrecognized character reference.`;
	}

	return [
		message,
		`HTML5 defines a set of [valid character references](${url}) but this is not a valid one.`,
		"",
		"Ensure that:",
		"",
		"1. The character is one of the listed names.",
		...(options.ignoreCase ? [] : ["1. The case is correct (names are case sensitive)."]),
		...(options.requireSemicolon ? ["1. The name is terminated with a `;`."] : []),
	].join("\n");
}

export default class UnknownCharReference extends Rule<RuleContext, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public static schema(): SchemaObject {
		return {
			ignoreCase: {
				type: "boolean",
			},
			requireSemicolon: {
				type: "boolean",
			},
		};
	}

	public documentation(context?: RuleContext): RuleDocumentation {
		return {
			description: getDescription(context, this.options),
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
				this.findCharacterReferences(node, child.textContent, child.location, {
					isAttribute: false,
				});
			}
		});

		this.on("attr", (event: AttributeEvent) => {
			/* boolean attributes has no value so nothing to validate */
			if (!event.value) {
				return;
			}

			this.findCharacterReferences(event.target, event.value.toString(), event.valueLocation, {
				isAttribute: true,
			});
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
		location: Location | null,
		{ isAttribute }: { isAttribute: boolean }
	): void {
		const isQuerystring = isAttribute && text.includes("?");
		for (const match of this.getMatches(text)) {
			this.validateCharacterReference(node, location, match, { isQuerystring });
		}
	}

	private validateCharacterReference(
		node: HtmlElement,
		location: Location | null,
		foobar: EntityMatch,
		{ isQuerystring }: { isQuerystring: boolean }
	): void {
		const { requireSemicolon } = this.options;
		const { match, entity, raw, terminated } = foobar;

		/* assume numeric entities are valid for now */
		if (isNumerical(entity)) {
			return;
		}

		/* special case: when attributes use query parameters we skip checking
		 * unterminated attributes */
		if (isQuerystring && !terminated) {
			return;
		}

		const found = this.entities.includes(entity);

		/* ignore if this is a known character reference name */
		if (found && (terminated || !requireSemicolon)) {
			return;
		}

		if (found && !terminated) {
			const entityLocation = getLocation(location, entity, match);
			const message = `Character reference "{{ entity }}" must be terminated by a semicolon`;
			const context: RuleContext = {
				entity: raw,
				terminated: false,
			};
			this.report(node, message, entityLocation, context);
			return;
		}

		const entityLocation = getLocation(location, entity, match);
		const message = `Unrecognized character reference "{{ entity }}"`;
		const context: RuleContext = {
			entity: raw,
			terminated: true,
		};
		this.report(node, message, entityLocation, context);
	}

	private *getMatches(text: string): IterableIterator<EntityMatch> {
		let match: RegExpMatchArray | null;
		do {
			match = regexp.exec(text);
			if (match) {
				const terminator = match[1]; // === ";" ? match[1] : "";
				const terminated = terminator === ";";
				const needSlice = terminator !== ";" && terminator.length > 0;
				const entity = needSlice ? match[0].slice(0, -1) : match[0];
				if (this.options.ignoreCase) {
					yield { match, entity: entity.toLowerCase(), raw: entity, terminated };
				} else {
					yield { match, entity, raw: entity, terminated };
				}
			}
		} while (match);
	}
}
