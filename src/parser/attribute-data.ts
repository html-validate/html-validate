import { DynamicValue } from "../dom";

/**
 * Raw attribute data.
 */
export interface AttributeData {
	/** Attribute name */
	key: string;

	/** Attribute value */
	value?: string | DynamicValue;

	/** Quotation mark (if present) */
	quote?: '"' | "'";

	/** Original attribute name (when a dynamic attribute is used), e.g
	 * "ng-attr-foo" or "v-bind:foo" */
	originalAttribute?: string;
}
