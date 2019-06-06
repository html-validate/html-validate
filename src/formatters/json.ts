import { FormatterModule } from ".";
import { Result } from "../reporter";

export default function jsonFormatter(results: Result[]) {
	return JSON.stringify(results);
}

declare const module: FormatterModule;
module.exports = jsonFormatter;
