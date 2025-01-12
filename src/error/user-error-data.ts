/**
 * Represents a `UserError`, i.e. an error thrown that is caused by something
 * the end user caused such as a misconfiguration.
 *
 * @public
 */
export interface UserErrorData extends Error {
	/**
	 * Returns a pretty formatted description of the error, if possible.
	 */
	prettyFormat(): string | undefined;
}
