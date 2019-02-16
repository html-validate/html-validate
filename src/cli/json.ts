import { EventDump } from "../engine";

const jsonFiltered = ["parent", "children", "meta"];

export function eventReplacer(key: string, value: any): string {
	if (value && key === "location") {
		return `${value.filename}:${value.line}:${value.column}`;
	}
	return jsonFiltered.indexOf(key) >= 0 ? "[truncated]" : value;
}

export function eventFormatter(entry: EventDump): string {
	const strdata = JSON.stringify(entry.data, eventReplacer, 2);
	return `${entry.event}: ${strdata}`;
}
