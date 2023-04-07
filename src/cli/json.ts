import { type EventDump, type Location } from "..";

const jsonIgnored = ["unique", "cache", "disabledRules", "blockedRules"];
const jsonFiltered = ["parent", "childNodes", "children", "meta", "data", "originalData"];

function isLocation(key: string, value: unknown): value is Location {
	return Boolean(value && key === "location");
}

export function eventReplacer<T>(this: void, key: string, value: T): T | string | undefined {
	if (isLocation(key, value)) {
		return `${value.filename}:${value.line}:${value.column}`;
	}
	const isIgnored = jsonIgnored.includes(key);
	if (isIgnored) {
		return undefined;
	}

	const isFiltered = jsonFiltered.includes(key);
	return isFiltered ? "[truncated]" : value;
}

export function eventFormatter(entry: EventDump): string {
	const strdata = JSON.stringify(entry.data, eventReplacer, 2);
	return `${entry.event}: ${strdata}`;
}
