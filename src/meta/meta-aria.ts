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
 * @since 8.11.0
 */
export interface MetaAria {
	/**
	 * Implicit ARIA role.
	 *
	 * Can be set either to a string (element unconditionally has given role) or a
	 * callback (role depends on the context the element is used in).
	 *
	 * @since 8.11.0
	 */
	implicitRole?: string | MetaImplicitRoleCallback;

	/**
	 * If set to `"prohibited"` this element may not specify an accessible name
	 * with `aria-label` or `aria-labelledby`. Defaults to `"allowed"` if unset.
	 *
	 * Note: if the element overrides the `role` (i.e. the `role` attribute is set to
	 * something other than the implicit role) naming may or may not be allowed
	 * depending on the given role instead.
	 *
	 * @since 8.11.0
	 */
	naming?: "allowed" | "prohibited" | ((node: HtmlElementLike) => "allowed" | "prohibited");
}

/**
 * Element ARIA metadata.
 *
 * @public
 * @since 8.11.0
 */
export interface NormalizedMetaAria {
	/**
	 *
	 * Normalized version of {@link MetaAria.implicitRole}. Always a callback
	 * returning the role.
	 *
	 * @since 8.11.0
	 * @returns string with role or null if no corresponding role.
	 */
	implicitRole(node: HtmlElementLike): string | null;

	/**
	 *
	 * Normalized version of {@link MetaAria.naming}. Always a callback
	 * returning `"allowed"` or `"prohibited"`.
	 *
	 * @since 8.11.0
	 */
	naming(node: HtmlElementLike): "allowed" | "prohibited";
}
