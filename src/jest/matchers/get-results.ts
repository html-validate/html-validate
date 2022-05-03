import { FileSystemConfigLoader } from "../../config/loaders/file-system";
import { type Report, type Result } from "../../reporter";
import HtmlValidate from "../../htmlvalidate";

/**
 * @internal
 */
export function getResults(filename: string, value: Report | string): Result[] {
	if (typeof value === "string") {
		const loader = new FileSystemConfigLoader({
			extends: ["html-validate:recommended"],
		});
		const htmlvalidate = new HtmlValidate(loader);
		const report = htmlvalidate.validateString(value, filename, {
			rules: {
				"void-style": "off",
			},
		});
		return report.results.map((it) => {
			return { ...it, filePath: "inline" };
		});
	} else {
		return value.results;
	}
}
