import fs from "fs";
import path from "path";
import { Formatter } from "../formatters";
import { Report, Result } from "../reporter";

type WrappedFormatter = (results: Result[]) => string;

function wrap(
	formatter: Formatter,
	dst: string
): (results: Result[]) => string {
	return (results: Result[]) => {
		const output = formatter(results);
		if (dst) {
			const dir = path.dirname(dst);
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}
			fs.writeFileSync(dst, output, "utf-8");
			return null;
		} else {
			return output;
		}
	};
}

export function getFormatter(formatters: string): (report: Report) => string {
	const fn: WrappedFormatter[] = formatters.split(",").map((cur) => {
		const [name, dst] = cur.split("=", 2);
		const moduleName = name.replace(/[^a-z]+/g, "");
		/* eslint-disable-next-line import/no-dynamic-require */
		const formatter = require(`../formatters/${moduleName}`);
		return wrap(formatter, dst);
	});
	return (report: Report) => {
		return fn
			.map((formatter: WrappedFormatter) => formatter(report.results))
			.filter(Boolean)
			.join("\n");
	};
}
