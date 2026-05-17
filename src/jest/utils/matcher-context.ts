import { type DiffOptions } from "jest-diff";

/**
 * @internal
 */
export interface MatcherContext {
	equals(a: unknown, b: unknown): boolean;
	expand?: boolean;
	testPath?: string;
	utils: {
		diff(a: unknown, b: unknown, options?: DiffOptions): string | null | undefined;
		matcherHint(
			matcherName: string,
			received?: string,
			expected?: string,
			options?: { comment?: string },
		): string;
		printReceived(object: unknown): string;
		printExpected(value: unknown): string;
	};
}
