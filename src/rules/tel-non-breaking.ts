import { sliceLocation } from "../context";
import { HtmlElement, isElementNode, isTextNode, TextNode } from "../dom";
import { ElementReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl, SchemaObject } from "../rule";

interface Character {
	pattern: string;
	replacement: string;
	description: string;
}

export interface RuleContext {
	pattern: string;
	replacement: string;
	description: string;
}

interface RuleOptions {
	characters: Character[];
	ignoreClasses: string[];
}

const defaults: RuleOptions = {
	characters: [
		{ pattern: " ", replacement: "&nbsp;", description: "non-breaking space" },
		{ pattern: "-", replacement: "&#8209;", description: "non-breaking hyphen" },
	],
	ignoreClasses: [],
};

export function constructRegex(characters: Character[]): RegExp {
	const disallowed = characters
		.map((it) => {
			return it.pattern;
		})
		.join("|");
	const pattern = `(${disallowed})`;
	/* eslint-disable-next-line security/detect-non-literal-regexp */
	return new RegExp(pattern, "g");
}

function getText(node: TextNode): [offset: number, text: string] {
	/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
	const match = node.textContent.match(/^(\s*)(.*)$/)!;
	const [, leading, text] = match;
	return [leading.length, text.trimEnd()];
}

/**
 * Node 12 does not support String.matchAll, this simulates it's behavior.
 */
function matchAll(text: string, regexp: RegExp): RegExpExecArray[] {
	/* eslint-disable-next-line security/detect-non-literal-regexp */
	const copy = new RegExp(regexp);
	const matches: RegExpExecArray[] = [];
	/* eslint-disable-next-line no-constant-condition */
	while (true) {
		const match = copy.exec(text);
		if (match === null) {
			break;
		}
		matches.push(match);
	}
	return matches;
}

export default class TelNonBreaking extends Rule<RuleContext, RuleOptions> {
	private regex: RegExp;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.regex = constructRegex(this.options.characters);
	}

	public static schema(): SchemaObject {
		return {
			characters: {
				type: "array",
				items: {
					type: "object",
					additionalProperties: false,
					properties: {
						pattern: {
							type: "string",
						},
						replacement: {
							type: "string",
						},
						description: {
							type: "string",
						},
					},
				},
			},
			ignoreClasses: {
				type: "array",
				items: {
					type: "string",
				},
			},
		};
	}

	public documentation(context?: RuleContext): RuleDocumentation {
		const { characters } = this.options;
		const replacements = characters.map((it) => {
			return `  - \`${it.pattern}\` - replace with \`${it.replacement}\` (${it.description}).`;
		});
		return {
			description: [
				context
					? `The \`${context.pattern}\` character should be replaced with \`${context.replacement}\` character (${context.description}) when used in a telephone number.`
					: `Replace this character with a non-breaking version.`,
				"",
				"Unless non-breaking characters is used there could be a line break inserted at that character.",
				"Line breaks make is harder to read and understand the telephone number.",
				"",
				"The following characters should be avoided:",
				"",
				...replacements,
			].join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("element:ready", this.isRelevant, (event: ElementReadyEvent) => {
			const { target } = event;
			const { ignoreClasses } = this.options;

			/* skip if element has a class in the ignore list */
			const isIgnored = ignoreClasses.some((it) => target.classList.contains(it));
			if (isIgnored) {
				return;
			}

			this.walk(target, target);
		});
	}

	private isRelevant(this: void, event: ElementReadyEvent): boolean {
		const { target } = event;

		/* should only deal with anchors */
		if (!target.is("a")) {
			return false;
		}

		/* ignore if anchor does not have tel href */
		const attr = target.getAttribute("href");
		if (!attr || !attr.valueMatches(/^tel:/, false)) {
			return false;
		}

		return true;
	}

	private walk(anchor: HtmlElement, node: HtmlElement): void {
		for (const child of node.childNodes) {
			if (isTextNode(child)) {
				this.detectDisallowed(anchor, child);
			} else if (isElementNode(child)) {
				this.walk(anchor, child);
			}
		}
	}

	private detectDisallowed(anchor: HtmlElement, node: TextNode): void {
		const [offset, text] = getText(node);
		const matches = matchAll(text, this.regex);
		for (const match of matches) {
			const detected = match[0];
			const entry = this.options.characters.find((it) => it.pattern === detected);
			/* istanbul ignore next: should never happen and cannot be tested, just a sanity check */
			if (!entry) {
				throw new Error(`Failed to find entry for "${detected}" when searching text "${text}"`);
			}
			const message = `"${detected}" should be replaced with "${entry.replacement}" (${entry.description}) in telephone number`;
			const begin = offset + match.index;
			const end = begin + detected.length;
			const location = sliceLocation(node.location, begin, end);
			const context: RuleContext = entry;
			this.report(anchor, message, location, context);
		}
	}
}
