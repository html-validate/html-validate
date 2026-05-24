const SYNTAX_CHARACTERS = /[$()*+.?[\\\]^{|}]/;
const CONTROL_ESCAPES = new Map([
	["\t", "t"],
	["\n", "n"],
	["\v", "v"],
	["\f", "f"],
	["\r", "r"],
]);

const OTHER_PUNCTUATORS = /^[!"#%&',:;<=>@`~-]$/;
const WHITE_SPACE = /^[\t\v\f\uFEFF\p{Zs}]$/u;
const LINE_TERMINATOR = /^[\n\r\u2028\u2029]$/;
const SURROGATE = /^[\uD800-\uDFFF]$/;

function isDecimalDigitOrASCIILetter(ch: string): boolean {
	return /^[\dA-Za-z]$/.test(ch);
}

function needEscape(ch: string): boolean {
	return (
		OTHER_PUNCTUATORS.test(ch) ||
		WHITE_SPACE.test(ch) ||
		LINE_TERMINATOR.test(ch) ||
		SURROGATE.test(ch)
	);
}

function unicodeEscape(ch: string): string {
	/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we know it exists */
	return `\\u${ch.codePointAt(0)!.toString(16).padStart(4, "0")}`;
}

function encodeForRegExpEscape(ch: string): string {
	if (SYNTAX_CHARACTERS.test(ch) || ch === "/") {
		return `\\${ch}`;
	}

	if (CONTROL_ESCAPES.has(ch)) {
		/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we just checked that it exists */
		return `\\${CONTROL_ESCAPES.get(ch)!}`;
	}

	if (needEscape(ch)) {
		/* eslint-disable-next-line no-control-regex -- intentional */
		if (/[\u0000-\u00FF]/.test(ch)) {
			/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we know it exists */
			return `\\x${ch.codePointAt(0)!.toString(16).padStart(2, "0")}`;
		}

		return ch
			.split("")
			.map((c) => unicodeEscape(c))
			.join("");
	}
	return ch;
}

/**
 * Implementation of TC39 proposal for RegExp.escape() method, which is not
 * yet supported on all platforms.
 *
 * @internal
 * @deprecated Polyfill for RegExp.escape() which is not yet supported on all platforms.
 */
export function regexpEscape(str: string): string {
	let escaped = "";
	for (const c of str) {
		if (escaped === "" && isDecimalDigitOrASCIILetter(c)) {
			/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we know it exists */
			escaped += `\\x${c.codePointAt(0)!.toString(16).padStart(2, "0")}`;
		} else {
			escaped += encodeForRegExpEscape(c);
		}
	}
	return escaped;
}
