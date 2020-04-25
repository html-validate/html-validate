import { Result } from "../reporter";
import { Formatter } from "./formatter";

function jsonFormatter(results: Result[]): string {
	return JSON.stringify(results);
}

const formatter: Formatter = jsonFormatter;
export default formatter;
