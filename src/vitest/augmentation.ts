/** module augmentation: vitest.d.ts */
import { type ConfigData } from "../config";
import { type Message } from "../reporter";

declare module "vitest" {
	interface Assertion<T = any> {
		/**
		 * @since %version%
		 */
		toBeValid(): T;

		/**
		 * @since %version%
		 */
		toBeInvalid(): T;

		/**
		 * @since %version%
		 */
		toHaveError(error: Partial<Message>): T;

		/**
		 * @since %version%
		 */
		toHaveError(ruleId: string, message: string, context?: any): T;

		/**
		 * @since %version%
		 */
		toHaveErrors(errors: Array<[string, string] | Record<string, unknown>>): T;

		/**
		 * Validate string or HTMLElement.
		 *
		 * Test passes if result is valid.
		 *
		 * @param config - Optional HTML-Validate configuration object.
		 * @param filename - Optional filename used when matching transformer and
		 * loading configuration.
		 *
		 * @since %version%
		 */
		toHTMLValidate(filename?: string): T;
		toHTMLValidate(config: ConfigData, filename?: string): T;
		toHTMLValidate(error: Partial<Message>, filename?: string): T;
		toHTMLValidate(error: Partial<Message>, config: ConfigData, filename?: string): T;
	}
}
/** module augmentation end */
