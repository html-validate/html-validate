import "./jest";

import { type Location } from "../context";
import { type TokenType } from "../lexer";
import { toBeToken } from "./internal-matchers";

interface TokenMatcher {
	type: TokenType;
	location?: Partial<Location>;
	data?: any;
}

declare global {
	/* eslint-disable-next-line @typescript-eslint/no-namespace -- module augmentation */
	namespace jest {
		/* eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars -- to match jest declaration */
		interface Matchers<R, T = {}> {
			toBeToken(expected: TokenMatcher): R;
		}
	}
}

expect.extend({
	toBeToken: toBeToken(expect),
});
