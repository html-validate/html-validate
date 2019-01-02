import { Formatter } from "../formatters";
import { Report, Result } from "../reporter";

const fs = require("fs");

type WrappedFormatter = (results: Result[]) => void;

function wrap(formatter: Formatter, dst: string) {
	return (results: Result[]) => {
		const output = formatter(results);
		if (dst) {
			fs.writeFileSync(dst, output, "utf-8");
		} else {
			process.stdout.write(output);
		}
	};
}

export function getFormatter(formatters: string): (report: Report) => void {
	const fn: WrappedFormatter[] = formatters
		.split(",")
		.map((cur) => {
			const [name, dst] = cur.split("=", 2);
			const moduleName = name.replace(/[^a-z]+/g, "");
			const formatter = require(`../formatters/${moduleName}`);
			return wrap(formatter, dst);
		});
	return (report: Report) => {
		fn.forEach((formatter: WrappedFormatter) => formatter(report.results));
	};
}
