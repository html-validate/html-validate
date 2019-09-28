import HtmlValidate from "htmlvalidate";
import { Report } from "../reporter";
import { expandFiles, ExpandOptions } from "./expand-files";
import { getFormatter } from "./formatter";

export class CLI {
	public expandFiles(
		patterns: string[],
		options: ExpandOptions = {}
	): string[] {
		return expandFiles(patterns, options);
	}

	public getFormatter(formatters: string): (report: Report) => string {
		return getFormatter(formatters);
	}

	public getValidator(): HtmlValidate {
		return new HtmlValidate();
	}
}
