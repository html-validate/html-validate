import fs from "fs";
import path from "path";
import { getFormatter as formatterFactory, Formatter } from "../formatters";
import { Report, Result } from "../reporter";
import { UserError } from "../error";

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

function loadFormatter(name: string): Formatter {
	const fn = formatterFactory(name);
	if (!fn) {
		throw new UserError(`No formatter named "${name}"`);
	}
	return fn;
}

export function getFormatter(formatters: string): (report: Report) => string {
	const fn: WrappedFormatter[] = formatters.split(",").map((cur) => {
		const [name, dst] = cur.split("=", 2);
		const fn = loadFormatter(name);
		return wrap(fn, dst);
	});
	return (report: Report) => {
		return fn
			.map((formatter: WrappedFormatter) => formatter(report.results))
			.filter(Boolean)
			.join("\n");
	};
}
