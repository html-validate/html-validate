import { ConfigData } from "../../config";
import { Location } from "../../context";
import { Message } from "../../reporter";
import { TokenType } from "../../lexer";
import toBeValid from "./to-be-valid";
import toBeInvalid from "./to-be-invalid";
import toBeToken from "./to-be-token";
import toHTMLValidate from "./to-htmlvalidate";
import toHaveError from "./to-have-error";
import toHaveErrors from "./to-have-errors";

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
			toBeValid(): R;
			toBeInvalid(): R;
			toBeToken(expected: TokenMatcher): R;
			toHaveError(ruleId: string, message: string, context?: any): R;
			toHaveErrors(errors: Array<[string, string] | Record<string, unknown>>): R;

			/**
			 * Validate string or HTMLElement.
			 *
			 * Test passes if result is valid.
			 *
			 * @param config - Optional HTML-Validate configuration object.
			 * @param filename - Optional filename used when matching transformer and
			 * loading configuration.
			 */
			toHTMLValidate(): R;
			toHTMLValidate(filename: string): R;
			toHTMLValidate(config: ConfigData): R;
			toHTMLValidate(config: ConfigData, filename: string): R;
			toHTMLValidate(error: Partial<Message>): R;
			toHTMLValidate(error: Partial<Message>, filename: string): R;
			toHTMLValidate(error: Partial<Message>, config: ConfigData): R;
			toHTMLValidate(error: Partial<Message>, config: ConfigData, filename: string): R;
		}
	}
}

expect.extend({
	toBeValid,
	toBeInvalid,
	toHaveError,
	toHaveErrors,
	toBeToken,
	toHTMLValidate,
});
