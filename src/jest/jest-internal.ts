import "./jest";

import { Location } from "../context";
import { TokenType } from "../lexer";
import { toBeToken } from "./internal-matchers";

interface TokenMatcher {
	type: TokenType;
	location?: Partial<Location>;
	data?: any;
}

declare global {
	/* eslint-disable-next-line @typescript-eslint/no-namespace */
	namespace jest {
		/* eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars */
		interface Matchers<R, T = {}> {
			toBeToken(expected: TokenMatcher): R;
		}
	}
}

expect.extend({
	toBeToken,
});
