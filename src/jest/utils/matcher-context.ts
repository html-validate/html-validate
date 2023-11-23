/**
 * @internal
 */
export interface MatcherContext {
	equals(a: unknown, b: unknown): boolean;
	expand?: boolean;
	testPath?: string;
	utils: {
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
