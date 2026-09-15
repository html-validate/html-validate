import { type Autofix } from "./autofix";

/**
 * Reported error message.
 *
 * @public
 */
export interface Message {
	/** Rule that triggered this message */
	ruleId: string;

	/** URL to description of error */
	ruleUrl?: string;

	/** Severity of the message */
	severity: number;

	/** Message text */
	message: string;

	/** Offset (number of characters) into the source */
	offset: number;

	/** Line number */
	line: number;

	/** Column number */
	column: number;

	/** From start offset, how many characters is this message relevant for */
	size: number;

	/** DOM selector */
	selector: string | null;

	/**
	 * Optional error context used to provide context-aware documentation.
	 *
	 * This context can be passed to [[HtmlValidate#getRuleDocumentation]].
	 */
	context?: unknown;

	/**
	 * A callback for autofixing this error.
	 *
	 * The callback is bound to the source text it was generated for, see
	 * {@link Autofix}.
	 *
	 * @public
	 * @since 11.12.0
	 */
	fix?: Autofix | undefined;

	/**
	 * A list of callbacks with suggestions for fixing this error.
	 *
	 * Each callback is bound to the source text it was generated for, see
	 * {@link Autofix}.
	 *
	 * @public
	 * @since 11.12.0
	 */
	suggestions?:
		| Array<{
				message: string;
				fix: Autofix;
		  }>
		| undefined;
}
