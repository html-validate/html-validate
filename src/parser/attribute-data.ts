import { DynamicValue } from "../dom";

export interface AttributeData {
	/* attribute name */
	key: string;

	/* attribute value */
	value?: string | DynamicValue;

	/* quotation mark (if present) */
	quote?: '"' | "'";

	/* original attribute name (when a dynamic attribute is used), e.g
	 * "ng-attr-foo" or "v-bind:foo" */
	originalAttribute?: string;
}
