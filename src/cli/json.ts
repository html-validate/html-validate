import { type EventDump, type Location } from "..";

const jsonIgnored = new Set([
	"annotation",
	"blockedRules",
	"cache",
	"closed",
	"depth",
	"disabledRules",
	"nodeType",
	"unique",
	"voidElement",
]);
const jsonFiltered = new Set([
	"childNodes",
	"children",
	"data",
	"meta",
	"metaElement",
	"originalData",
	"parent",
]);

function isLocation(key: string, value: unknown): value is Location {
	return Boolean(value && (key === "location" || key.endsWith("Location")));
}

function isIgnored(key: string): boolean {
	return key.startsWith("_") || jsonIgnored.has(key);
}

function isFiltered(key: string, value: unknown): boolean {
	return Boolean(value && jsonFiltered.has(key));
}

export function eventReplacer<T>(this: void, key: string, value: T): T | string | undefined {
	if (isLocation(key, value)) {
		const filename = value.filename;
		const line = String(value.line);
		const column = String(value.column);
		return `${filename}:${line}:${column}`;
	}
	if (isIgnored(key)) {
		return undefined;
	}
	if (isFiltered(key, value)) {
		return "[truncated]";
	}
	return value;
}

export function eventFormatter(entry: EventDump): string {
	const strdata = JSON.stringify(entry.data, eventReplacer, 2);
	return `${entry.event}: ${strdata}`;
}
