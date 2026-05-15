/**
 * @internal
 */
export interface MatcherResult {
	pass: boolean;
	message: () => string;
	actual?: unknown;
	expected?: unknown;
}
