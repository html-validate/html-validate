import { type DynamicValue } from "../dom";

/**
 * Raw attribute data.
 *
 * @public
 */
export interface AttributeData {
	/** Attribute name */
	key: string;

	/** Attribute value */
	value: string | DynamicValue | null;

	/** Quotation mark (if present) */
	quote: '"' | "'" | null;

	/** Original attribute name (when a dynamic attribute is used), e.g
	 * "ng-attr-foo" or "v-bind:foo" */
	originalAttribute?: string;
}
