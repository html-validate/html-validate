import { ConfigData } from "../config";
import { Message } from "../reporter";
import {
	toBeValid,
	toBeInvalid,
	toHTMLValidate,
	toHaveError,
	toHaveErrors,
	toMatchCodeframe,
	toMatchInlineCodeframe,
} from "./matchers";

declare global {
	/* eslint-disable-next-line @typescript-eslint/no-namespace */
	namespace jest {
		/* eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars */
		interface Matchers<R, T = {}> {
			toBeValid(): R;
			toBeInvalid(): R;
			toHaveError(error: Partial<Message>): R;
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

			/**
			 * Writes out the given [[Report]] using codeframe formatter and compares
			 * with snapshot.
			 */
			toMatchCodeframe(snapshot?: string): R;

			/**
			 * Writes out the given [[Report]] using codeframe formatter and compares
			 * with inline snapshot.
			 */
			toMatchInlineCodeframe(snapshot?: string): R;
		}
	}
}

expect.extend({
	toBeValid,
	toBeInvalid,
	toHaveError,
	toHaveErrors,
	toHTMLValidate,
	toMatchCodeframe,
	toMatchInlineCodeframe,
});
