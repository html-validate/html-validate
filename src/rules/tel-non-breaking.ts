import { sliceLocation } from "../context";
import { type HtmlElement, type TextNode, isElementNode, isTextNode } from "../dom";
import { type ElementReadyEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

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
	ignoreStyle: boolean;
}

const defaults: RuleOptions = {
	characters: [
		{ pattern: " ", replacement: "&nbsp;", description: "non-breaking space" },
		{ pattern: "-", replacement: "&#8209;", description: "non-breaking hyphen" },
	],
	ignoreClasses: [],
	ignoreStyle: true,
};

export function constructRegex(characters: Character[]): RegExp {
	const disallowed = characters
		.map((it) => {
			return it.pattern;
		})
		.join("|");
	const pattern = `(${disallowed})`;
	/* eslint-disable-next-line security/detect-non-literal-regexp -- technical debt, should do more input sanitation */
	return new RegExp(pattern, "g");
}

function getText(node: TextNode): [offset: number, text: string] {
	/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- this will always match something, it cannot be null */
	const match = node.textContent.match(/^(\s*)(.*)$/)!;
	const [, leading, text] = match;
	return [leading.length, text.trimEnd()];
}

/**
 * Node 12 does not support String.matchAll, this simulates it's behavior.
 */
function matchAll(text: string, regexp: RegExp): RegExpExecArray[] {
	/* eslint-disable-next-line security/detect-non-literal-regexp -- makes copy of existing one only */
	const copy = new RegExp(regexp);
	const matches: RegExpExecArray[] = [];
	let match: RegExpExecArray | null;
	while ((match = copy.exec(text))) {
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
			ignoreStyle: {
				type: "boolean",
			},
		};
	}

	public documentation(context: RuleContext): RuleDocumentation {
		const { characters } = this.options;
		const replacements = characters.map((it) => {
			return `  - \`${it.pattern}\` - replace with \`${it.replacement}\` (${it.description}).`;
		});
		return {
			description: [
				`The \`${context.pattern}\` character should be replaced with \`${context.replacement}\` character (${context.description}) when used in a telephone number.`,
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

			if (this.isIgnored(target)) {
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
		if (!attr?.valueMatches(/^tel:/, false)) {
			return false;
		}

		return true;
	}

	private isIgnoredClass(node: HtmlElement): boolean {
		const { ignoreClasses } = this.options;
		const { classList } = node;
		return ignoreClasses.some((it) => classList.contains(it));
	}

	private isIgnoredStyle(node: HtmlElement): boolean {
		const { ignoreStyle } = this.options;
		const { style } = node;
		if (!ignoreStyle) {
			return false;
		}
		if (style["white-space"] === "nowrap" || style["white-space"] === "pre") {
			return true;
		}
		return false;
	}

	private isIgnored(node: HtmlElement): boolean {
		return this.isIgnoredClass(node) || this.isIgnoredStyle(node);
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
