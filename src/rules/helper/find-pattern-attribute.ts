import { type NormalizedPatternAttribute } from "../../meta";

/**
 * @internal
 */
export function findPatternAttribute(
	attrName: string,
	dynamicAttributes: NormalizedPatternAttribute[],
): NormalizedPatternAttribute | null {
	return dynamicAttributes.find((entry) => entry.regexp.test(attrName)) ?? null;
}
