import { Result } from "../reporter";
import { FormatterModule } from ".";

export default function jsonFormatter(results: Result[]): string {
	return JSON.stringify(results);
}

declare const module: FormatterModule;
module.exports = jsonFormatter;
