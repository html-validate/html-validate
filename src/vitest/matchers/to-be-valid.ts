import { type AsyncExpectationResult, type MatcherState } from "@vitest/expect";
import { FileSystemConfigLoader } from "../../config/loaders/file-system";
import { HtmlValidate } from "../../htmlvalidate";
import { type Report } from "../../reporter";

type ToBeValidMatcher = (
	this: MatcherState,
	received: Report | string | Promise<Report> | Promise<string>,
) => AsyncExpectationResult;

function createMatcher(): ToBeValidMatcher {
	const loader = new FileSystemConfigLoader({
		extends: ["html-validate:recommended"],
	});
	const htmlvalidate = new HtmlValidate(loader);

	async function toBeValid(
		this: MatcherState,
		received: Report | string | Promise<Report> | Promise<string>,
	): AsyncExpectationResult {
		const resolved = await received;

		let report: Report;
		if (typeof resolved === "string") {
			const filename = this.testPath ?? "inline";
			report = await htmlvalidate.validateString(resolved, filename, {
				rules: {
					"void-style": "off",
				},
			});
		} else {
			report = resolved;
		}

		if (report.valid) {
			return {
				pass: true,
				message: /* istanbul ignore next */ () => "Result should not contain error",
			};
		}

		const firstError = report.results[0].messages[0];
		return {
			pass: false,
			message: () => `Result should be valid but had error "${firstError.message}"`,
		};
	}

	return toBeValid;
}

export { createMatcher as toBeValid };
