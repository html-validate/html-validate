import { type DOMNode } from "./dom";
import { type Location } from "./location";

/**
 * @public
 */
export interface ErrorDescriptor<ContextType> {
	node: DOMNode | null;
	message: string;
	location?: Location | null;
	context?: ContextType;
}
