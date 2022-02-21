import { format } from "util";

export function interpolate(text: string, data: Record<string, unknown>): string {
	return text.replace(/{{\s*([^\s]+)\s*}}/g, (match, key): string => {
		return typeof data[key] !== "undefined" ? format(data[key]) : match;
	});
}
