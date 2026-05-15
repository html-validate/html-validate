import { expect } from "@jest/globals";
import { toBeToken } from "./matchers";
import { type TokenMatcher } from "./token-matcher";

declare module "expect" {
	/* eslint-disable-next-line @typescript-eslint/no-unused-vars -- to match jest declaration */
	interface Matchers<R, T> {
		toBeToken(expected: TokenMatcher): R;
	}
}

expect.extend({
	toBeToken: toBeToken(expect),
});
