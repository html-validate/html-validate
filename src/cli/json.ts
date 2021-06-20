import { EventDump } from "../main";

const jsonFiltered = ["parent", "children", "meta"];

/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
export function eventReplacer(key: string, value: any): string {
	if (value && key === "location") {
		return `${value.filename}:${value.line}:${value.column}`;
	}
	return jsonFiltered.includes(key) ? "[truncated]" : value;
}

export function eventFormatter(entry: EventDump): string {
	const strdata = JSON.stringify(entry.data, eventReplacer, 2);
	return `${entry.event}: ${strdata}`;
}
