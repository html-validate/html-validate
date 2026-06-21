const enum State {
	INITIAL,
	ESCAPED,
	WHITESPACE,
}

const escapedCodepoints = new Set(["\u{39}", "\u{61}", "\u{64}"]);

/**
 * @internal
 */
export function* splitSelectorElements(selector: string): Generator<string, void> {
	let begin = 0;
	let end = 0;

	function initialState(ch: string, p: number): State {
		if (ch === "\\") {
			return State.ESCAPED;
		}
		if (ch === " ") {
			end = p;
			return State.WHITESPACE;
		}
		return State.INITIAL;
	}

	function escapedState(ch: string): State {
		if (escapedCodepoints.has(ch)) {
			return State.ESCAPED;
		}
		return State.INITIAL;
	}

	function* whitespaceState(ch: string, p: number): Generator<string, State> {
		if (ch === " ") {
			return State.WHITESPACE;
		}
		yield selector.slice(begin, end);
		begin = p;
		end = p;
		return State.INITIAL;
	}

	let state = State.INITIAL;

	/* eslint-disable-next-line unicorn/no-for-loop -- while it could be
	 * replaced with for..of using `.split("").entries()` it doesn't really
	 * seem more efficient or readable, and this is well covered by testcases
	 * for off-by-one errors */
	for (let p = 0; p < selector.length; p++) {
		const ch = selector[p];
		switch (state) {
			case State.INITIAL:
				state = initialState(ch, p);
				/* eslint-disable-next-line unicorn/no-break-in-nested-loop -- technical debt */
				break;

			case State.ESCAPED:
				state = escapedState(ch);
				/* eslint-disable-next-line unicorn/no-break-in-nested-loop -- technical debt */
				break;

			case State.WHITESPACE:
				state = yield* whitespaceState(ch, p);
				/* eslint-disable-next-line unicorn/no-break-in-nested-loop -- technical debt */
				break;
		}
	}

	if (begin !== selector.length) {
		yield selector.slice(begin);
	}
}
