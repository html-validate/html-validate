import { Report, Result } from "../reporter";

const fs = require("fs");

type Formatter = (results: Result[]) => void;

function wrap(formatter: any, dst: string){
	return (results: Result[]) => {
		const output = formatter(results);
		if (dst){
			fs.writeFileSync(dst, output, "utf-8");
		} else {
			process.stdout.write(output);
		}
	};
}

export function getFormatter(formatters: string): (report: Report) => void {
	const fn: Formatter[] = formatters
		.split(",")
		.map((cur) => {
			const [name, dst] = cur.split("=", 2);
			const moduleName = name.replace(/[^a-z]+/g, "");
			const formatter = require(`../formatters/${moduleName}`);
			return wrap(formatter, dst);
		});
	return (report: Report) => {
		fn.forEach((formatter: Formatter) => formatter(report.results));
	};
}
