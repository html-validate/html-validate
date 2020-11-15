import stylishImpl from "@html-validate/stylish";
import { Result } from "../reporter";
import { Formatter } from "./formatter";

function stylish(results: Result[]): string {
	return stylishImpl(
		results.map((it) => ({
			...it,
			fixableErrorCount: 0,
			fixableWarningCount: 0,
		}))
	);
}

const formatter: Formatter = stylish;
export default formatter;
