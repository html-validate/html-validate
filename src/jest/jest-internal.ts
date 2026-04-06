import { expect } from "@jest/globals";
import "./jest";

import { type TokenType } from "../lexer";
import { type Location } from "../location";
import { toBeToken } from "./internal-matchers";

interface TokenMatcher {
	type: TokenType;
	location?: Partial<Record<keyof Location, unknown>>;
	data?: unknown;
}

declare module "expect" {
	/* eslint-disable-next-line @typescript-eslint/no-unused-vars -- to match jest declaration */
	interface Matchers<R, T> {
		toBeToken(expected: TokenMatcher): R;
	}
}

expect.extend({
	toBeToken: toBeToken(expect),
});
