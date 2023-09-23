import fs from "fs";
import path from "node:path";
import { type Formatter, type Report, type Result, UserError, formatterFactory } from "..";
import { ensureError } from "../error";
import { legacyRequire } from "../resolve";

type WrappedFormatter = (results: Result[]) => string;

function wrap(formatter: Formatter, dst: string): (results: Result[]) => string {
	return (results: Result[]) => {
		const output = formatter(results);
		if (dst) {
			const dir = path.dirname(dst);
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}
			fs.writeFileSync(dst, output, "utf-8");
			return "";
		} else {
			return output;
		}
	};
}

function loadFormatter(name: string): Formatter {
	const fn = formatterFactory(name);
	if (fn) {
		return fn;
	}

	try {
		return legacyRequire(name) as Formatter;
	} catch (error: unknown) {
		throw new UserError(`No formatter named "${name}"`, ensureError(error));
	}
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
