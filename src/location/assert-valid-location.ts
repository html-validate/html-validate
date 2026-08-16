import { type Location } from "./location";

declare const verifiedLocation: unique symbol;

/**
 * A {@link Location} which has been verified to have valid and in-range
 * fields using {@link assertValidLocation}.
 *
 * @internal
 */
export type VerifiedLocation = Location & { readonly [verifiedLocation]: true };

function isPositiveInteger(value: number): boolean {
	return Number.isSafeInteger(value) && value >= 0;
}

/**
 * Verify a {@link Location} has valid fields, i.e. `offset`, `line`,
 * `column` and `size` are all positive integers.
 *
 * If `length` is given `offset` must be strictly smaller than `length`,
 * while `offset + size` may be equal to `length` but not greater than it,
 * i.e. the location must fit within the half-open range `[0, length)`.
 *
 * @internal
 * @param location - Location to verify.
 * @param length - If given, verify the location is within this length.
 * @returns The same location, branded as verified.
 * @throws Error If any field is invalid or out of range.
 */
export function assertValidLocation(
	location: Location,
	length?: number,
): asserts location is VerifiedLocation {
	const { offset, line, column, size } = location;

	if (!isPositiveInteger(offset)) {
		throw new Error(`Location offset must be a positive integer but got ${offset}`);
	}

	if (!Number.isSafeInteger(line) || line < 1) {
		throw new Error(`Location line must be a positive integer but got ${line}`);
	}

	if (!Number.isSafeInteger(column) || column < 1) {
		throw new Error(`Location column must be a positive integer but got ${column}`);
	}

	if (!isPositiveInteger(size)) {
		throw new Error(`Location size must be a positive integer but got ${size}`);
	}

	if (length !== undefined) {
		if (offset >= length) {
			throw new Error(`Location offset ${offset} must be smaller than length ${length}`);
		}

		if (offset + size > length) {
			throw new Error(
				`Location offset + size ${offset + size} must be smaller than length ${length}`,
			);
		}
	}
}
