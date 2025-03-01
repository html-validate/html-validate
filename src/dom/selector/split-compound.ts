/**
 * Returns true if the character is a delimiter for different kinds of selectors:
 *
 * - `.` - begins a class selector
 * - `#` - begins an id selector
 * - `[` - begins an attribute selector
 * - `:` - begins a pseudo class or element selector
 */
function isDelimiter(ch: string): boolean {
	return /[.#[:]/.test(ch);
}

/**
 * Returns true if the character is a quotation mark.
 */
function isQuotationMark(ch: string): ch is '"' | "'" {
	return /['"]/.test(ch);
}

function isPseudoElement(ch: string, buffer: string): boolean {
	return ch === ":" && buffer === ":";
}

/**
 * @internal
 */
export function* splitCompound(pattern: string): Generator<string> {
	if (pattern === "") {
		return;
	}

	const end = pattern.length;

	let begin = 0;
	let cur = 1;
	let quoted: false | '"' | "'" = false;

	while (cur < end) {
		const ch = pattern[cur];
		const buffer = pattern.slice(begin, cur);

		/* escaped character, ignore whatever is next */
		if (ch === "\\") {
			cur += 2;
			continue;
		}

		/* if inside quoted string we only look for the end quotation mark */
		if (quoted) {
			if (ch === quoted) {
				quoted = false;
			}
			cur += 1;
			continue;
		}

		/* if the character is a quotation mark we store the character and the above
		 * condition will look for a similar end quotation mark */
		if (isQuotationMark(ch)) {
			quoted = ch;
			cur += 1;
			continue;
		}

		/* special case when using :: pseudo element selector */
		if (isPseudoElement(ch, buffer)) {
			cur += 1;
			continue;
		}

		/* if the character is a delimiter we yield the string and reset the
		 * position */
		if (isDelimiter(ch)) {
			begin = cur;
			yield buffer;
		}

		cur += 1;
	}

	/* yield the rest of the string */
	const tail = pattern.slice(begin, cur);
	yield tail;
}
