/* istanbul ignore file: this file is only for easier mocking */

/**
 * Wrapper around import() so we can mock it in unittests.
 *
 * @internal
 */
export function importFunction(id: string): unknown {
	return import(id);
}
