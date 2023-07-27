import { type EventDump, type Location } from "..";

const jsonIgnored = [
	"annotation",
	"blockedRules",
	"cache",
	"closed",
	"depth",
	"disabledRules",
	"nodeType",
	"unique",
	"voidElement",
];
const jsonFiltered = ["parent", "childNodes", "children", "meta", "data", "originalData"];

function isLocation(key: string, value: unknown): value is Location {
	return Boolean(value && key === "location");
}

function isIgnored(key: string): boolean {
	return jsonIgnored.includes(key);
}

function isFiltered(key: string): boolean {
	return jsonFiltered.includes(key);
}

export function eventReplacer<T>(this: void, key: string, value: T): T | string | undefined {
	if (isLocation(key, value)) {
		return `${value.filename}:${value.line}:${value.column}`;
	}
	if (isIgnored(key)) {
		return undefined;
	}
	if (isFiltered(key)) {
		return "[truncated]";
	}
	return value;
}

export function eventFormatter(entry: EventDump): string {
	const strdata = JSON.stringify(entry.data, eventReplacer, 2);
	return `${entry.event}: ${strdata}`;
}
