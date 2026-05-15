import { type TokenType } from "../lexer";
import { type Location } from "../location";

/**
 * @internal
 */
export interface TokenMatcher {
	type: TokenType;
	location?: Partial<Record<keyof Location, unknown>>;
	data?: unknown;
}
