import { type AsyncExpectationResult, type MatcherState } from "@vitest/expect";
import { FileSystemConfigLoader } from "../../config/loaders/file-system";
import { HtmlValidate } from "../../htmlvalidate";
import { type Report } from "../../reporter";

type ToBeInvalidMatcher = (
	this: MatcherState,
	received: Report | string | Promise<Report> | Promise<string>,
) => AsyncExpectationResult;

function createMatcher(): ToBeInvalidMatcher {
	const loader = new FileSystemConfigLoader({
		extends: ["html-validate:recommended"],
	});
	const htmlvalidate = new HtmlValidate(loader);

	async function toBeInvalid(
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
				pass: false,
				message: () => "Result should be invalid but had no errors",
			};
		}
		return {
			pass: true,
			message: /* istanbul ignore next */ () => "Result should not contain error",
		};
	}

	return toBeInvalid;
}

export { createMatcher as toBeInvalid };
