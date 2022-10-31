import checkstyle from "./checkstyle";
import codeframe from "./codeframe"; // eslint-disable-line import/no-named-as-default
import json from "./json";
import stylish from "./stylish";
import text from "./text";
import { Formatter } from "./formatter";

export { type Formatter } from "./formatter";

interface AvailableFormatters {
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
 * @internal
 * @param name - Name of formatter.
 * @returns Formatter function or null if it doesn't exist.
 */
export function getFormatter(name: keyof AvailableFormatters): Formatter;
export function getFormatter(name: string): Formatter | null;
export function getFormatter(name: string): Formatter | null {
	return availableFormatters[name] ?? null;
}
