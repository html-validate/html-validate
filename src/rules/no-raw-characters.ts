import { type Location, sliceLocation } from "../context";
import { type DOMNode, NodeType } from "../dom";
import { type AttributeEvent, type ElementReadyEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

interface RuleOptions {
	relaxed: boolean;
}

const defaults: RuleOptions = {
	relaxed: false,
};

type RawCharacters = '"' | "&" | "'" | "<" | "=" | ">" | "`";

const textRegexp = /([<>]|&(?![a-zA-Z0-9#]+;))/g;
const unquotedAttrRegexp = /([<>"'=`]|&(?![a-zA-Z0-9#]+;))/g;
const matchTemplate = /^(<%.*?%>|<\?.*?\?>|<\$.*?\$>)$/s;

const replacementTable: Record<RawCharacters, string> = {
	'"': "&quot;",
	"&": "&amp;",
	"'": "&apos;",
	"<": "&lt;",
	"=": "&equals;",
	">": "&gt;",
	"`": "&grave;",
};

export default class NoRawCharacters extends Rule<void, RuleOptions> {
	private relaxed: boolean;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.relaxed = this.options.relaxed;
	}

	public static override schema(): SchemaObject {
		return {
			relaxed: {
				type: "boolean",
			},
		};
	}

	public override documentation(): RuleDocumentation {
		return {
			description: `Some characters such as \`<\`, \`>\` and \`&\` hold special meaning in HTML and must be escaped using a character reference (html entity).`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("element:ready", (event: ElementReadyEvent) => {
			const node = event.target;

			/* ignore <script> and <style> as its content is not html */
			if (node.textType !== "text") {
				return;
			}

			/* only iterate over direct descendants */
			for (const child of node.childNodes) {
				if (child.nodeType !== NodeType.TEXT_NODE) {
					continue;
				}

				/* workaround for templating <% ... %> etc */
				if (matchTemplate.exec(child.textContent)) {
					continue;
				}

				this.findRawChars(node, child.textContent, child.location, textRegexp);
			}
		});

		this.on("attr", (event: AttributeEvent) => {
			const { meta } = event;

			/* boolean attributes has no value so nothing to validate */
			if (!event.value) {
				return;
			}

			/* quoted attribute values can contain most symbols except the quotemark
			 * itself but unescaped quotemarks would cause a parsing error */
			if (event.quote) {
				return;
			}

			/* ignore boolean attribute as raw characters would not be allowed and
			 * this would be caught using attribute-allowed-values instead */
			if (meta?.boolean) {
				return;
			}

			this.findRawChars(
				event.target,
				event.value.toString(),
				event.valueLocation!, // eslint-disable-line @typescript-eslint/no-non-null-assertion -- technical debt, valueLocation is always set if a value is provided
				unquotedAttrRegexp,
			);
		});
	}

	/**
	 * Find raw special characters and report as errors.
	 *
	 * @param text - The full text to find unescaped raw characters in.
	 * @param location - Location of text.
	 * @param regexp - Regexp pattern to match using.
	 */
	private findRawChars(node: DOMNode, text: string, location: Location, regexp: RegExp): void {
		let match;
		do {
			match = regexp.exec(text);
			if (match) {
				const char = match[0] as RawCharacters;
				/* In relaxed mode & only needs to be encoded if it is ambiguous,
				 * however this rule will only match either non-ambiguous ampersands or
				 * ampersands part of a character reference. Whenever it is a valid
				 * character reference or not not checked by this rule */
				if (this.relaxed && char === "&") {
					continue;
				}

				/* determine replacement character and location */
				const replacement = replacementTable[char];
				const charLocation = sliceLocation(location, match.index, match.index + 1);

				/* report as error */
				this.report(node, `Raw "${char}" must be encoded as "${replacement}"`, charLocation);
			}
		} while (match);
	}
}
