const whitespace = new Set([" ", "\t", "\n", "\r", "\f"]);
const combinators = new Set(["+", ">", "~"]);
const escapedCodepoints = new Set(["9", "a", "d"]);

/**
 * Split a complex selector into compounds. Whitespace separates compounds
 * except inside quoted strings, brackets and parentheses. Whitespace around
 * combinators is dropped and the combinator is kept as a prefix of the compound
 * it precedes, e.g. `ul > li` yields `ul` and `>li`.
 *
 * @internal
 */
export function* splitSelectorElements(selector: string): Generator<string, void> {
	const { length } = selector;
	let begin = 0;
	let p = 0;
	let depth = 0;
	let quote: string | null = null;
	let prefix = "";

	function skipWhitespace(): void {
		while (p < length && whitespace.has(selector[p])) {
			p++;
		}
	}

	/* escaped codepoints such as `\9 ` include the trailing space */
	function consumeEscape(ch: string): boolean {
		if (ch !== "\\") {
			return false;
		}
		p += escapedCodepoints.has(selector[p + 1]) ? 3 : 2;
		return true;
	}

	/* consumes quoted strings and bracketed content, returns true if the
	 * character at the current position was consumed */
	function consumeLiteral(ch: string): boolean {
		if (quote) {
			if (ch === quote) {
				quote = null;
			}
			p++;
			return true;
		}

		switch (ch) {
			case '"':
			case "'":
				quote = ch;
				break;
			case "[":
			case "(":
				depth++;
				break;
			case "]":
			case ")":
				depth = Math.max(0, depth - 1);
				break;
			default:
				if (depth === 0) {
					return false;
				}
		}

		p++;
		return true;
	}

	while (p < length) {
		const ch = selector[p];

		if (consumeEscape(ch) || consumeLiteral(ch)) {
			continue;
		}

		if (whitespace.has(ch)) {
			if (p > begin) {
				yield prefix + selector.slice(begin, p);
				prefix = "";
			}
			skipWhitespace();
			begin = p;
			continue;
		}

		if (combinators.has(ch)) {
			if (p > begin) {
				yield prefix + selector.slice(begin, p);
			}
			prefix = ch;
			p++;
			skipWhitespace();
			begin = p;
			continue;
		}

		p++;
	}

	if (begin < length || prefix) {
		yield prefix + selector.slice(begin);
	}
}
