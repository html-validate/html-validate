import { type NormalizedPatternAttribute } from "../../meta";

/**
 * @internal
 */
export function isPatternAttribute(
	attrName: string,
	dynamicAttributes: NormalizedPatternAttribute[],
): boolean {
	return dynamicAttributes.some((entry) => entry.regexp.test(attrName));
}
