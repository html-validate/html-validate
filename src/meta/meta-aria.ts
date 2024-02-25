import { type HtmlElementLike } from "./html-element-like";

/**
 * Callback for the `implicitRole` property of `MetaAria`. It takes a node and
 * returns the implicit ARIA role, if any.
 *
 * @public
 * @since 8.4.0
 * @param node - The node to get the role from.
 * @returns Implicit ARIA role or null if there is no implicit role.
 */
export type MetaImplicitRoleCallback = (node: HtmlElementLike) => string | null;

/**
 * Element ARIA metadata.
 *
 * @public
 * @since %version%
 */
export interface MetaAria {
	/**
	 * Implicit ARIA role.
	 *
	 * Can be set either to a string (element unconditionally has given role) or a
	 * callback (role depends on the context the element is used in).
	 *
	 * @since %version%
	 */
	implicitRole?: string | MetaImplicitRoleCallback;
}

/**
 * Element ARIA metadata.
 *
 * @public
 * @since %version%
 */
export interface NormalizedMetaAria {
	/**
	 *
	 * Normalized version of {@link MetaAria.implicitRole}. Always a callback
	 * returning the role.
	 *
	 * @since %version%
	 * @returns string with role or null if no corresponding role.
	 */
	implicitRole(node: HtmlElementLike): string | null;
}
