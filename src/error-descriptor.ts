import { type DOMNode } from "./dom";
import { type ErrorFixer } from "./error-fixer";
import { type Location } from "./location";

/**
 * @public
 */
export interface ErrorDescriptor<ContextType> {
	node: DOMNode | null;
	message: string;
	location?: Location | null;
	context?: ContextType;

	/**
	 * A callback for autofixing this error.
	 *
	 * @public
	 * @since 11.12.0
	 */
	fix?: ((fixer: ErrorFixer) => void | Promise<void>) | null | undefined;

	/**
	 * A list of callbacks with suggestions for fixing this error.
	 *
	 * @public
	 * @since 11.12.0
	 */
	suggestions?:
		| Array<{
				message: string;
				fix: (fixer: ErrorFixer) => void | Promise<void>;
		  }>
		| null
		| undefined;
}
