import checkstyle from "./checkstyle";
import { codeframe } from "./codeframe";
import { type Formatter } from "./formatter";
import json from "./json";
import stylish from "./stylish";
import text from "./text";

export { type Formatter } from "./formatter";

/**
 * @public
 */
export interface AvailableFormatters {
	checkstyle: Formatter;
	codeframe: Formatter;
	json: Formatter;
	stylish: Formatter;
	text: Formatter;
}

const availableFormatters: AvailableFormatters & Record<string, Formatter> = {
	checkstyle,
	codeframe,
	json,
	stylish,
	text,
};

/**
 * Get formatter function by name.
 *
 * @public
 * @param name - Name of formatter.
 * @returns Formatter function or null if it doesn't exist.
 */
export function getFormatter(name: keyof AvailableFormatters): Formatter;

/**
 * @public
 */
export function getFormatter(name: string): Formatter | null;

export function getFormatter(name: string): Formatter | null {
	return availableFormatters[name] ?? null;
}
