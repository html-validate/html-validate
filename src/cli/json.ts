import { EventDump, type Location } from "..";

const jsonFiltered = ["parent", "children", "meta"];

function isLocation(key: string, value: unknown): value is Location {
	return Boolean(value && key === "location");
}

/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
export function eventReplacer(this: void, key: string, value: any): any {
	if (isLocation(key, value)) {
		return `${value.filename}:${value.line}:${value.column}`;
	}
	const isFiltered = jsonFiltered.includes(key);
	return isFiltered ? "[truncated]" : value;
}

export function eventFormatter(entry: EventDump): string {
	const strdata = JSON.stringify(entry.data, eventReplacer, 2);
	return `${entry.event}: ${strdata}`;
}
