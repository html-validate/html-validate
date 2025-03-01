const enum State {
	INITIAL,
	ESCAPED,
	WHITESPACE,
}

const escapedCodepoints = ["\u0039", "\u0061", "\u0064"];

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
		if (escapedCodepoints.includes(ch)) {
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
	for (let p = 0; p < selector.length; p++) {
		const ch = selector[p];
		switch (state) {
			case State.INITIAL:
				state = initialState(ch, p);
				break;

			case State.ESCAPED:
				state = escapedState(ch);
				break;

			case State.WHITESPACE:
				state = yield* whitespaceState(ch, p);
				break;
		}
	}

	if (begin !== selector.length) {
		yield selector.slice(begin);
	}
}
