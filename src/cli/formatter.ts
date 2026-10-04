import fs from "node:fs";
import path from "node:path";
import { type Formatter, type Report, type Result, UserError, formatterFactory } from "..";
import { ensureError } from "../error";
import { legacyRequire } from "../resolve";

type WrappedFormatter = (results: Result[]) => string;

function getFileDescriptor(filePath: string): number | undefined {
	const { dir, base } = path.parse(filePath);
	if (dir !== "/dev/fd") {
		return undefined;
	}
	const fd = Number(base);
	/* istanbul ignore next -- not testing this error scenario */
	return Number.isNaN(fd) ? undefined : fd;
}

function wrap(formatter: Formatter, dst: string): (results: Result[]) => string {
	return (results: Result[]) => {
		const output = formatter(results);
		if (dst) {
			const buffer = Buffer.from(output, "utf-8");
			const fd = getFileDescriptor(dst);
			if (fd !== undefined) {
				let offset = 0;
				while (offset < buffer.length) {
					const written = fs.writeSync(fd, buffer, offset, buffer.length - offset);
					/* istanbul ignore next -- not testing this error scenario */
					if (written === 0) {
						throw new UserError(`Failed to write to file descriptor "${fd}"`);
					}
					offset += written;
				}
			} else {
				const dir = path.dirname(dst);
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir, { recursive: true });
				}
				fs.writeFileSync(dst, buffer, "utf-8");
			}
			return "";
		}
		return output;
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
