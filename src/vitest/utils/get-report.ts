import { type MatcherState } from "@vitest/expect";
import { defineConfig } from "../../config";
import { FileSystemConfigLoader } from "../../config/loaders/file-system";
import { HtmlValidate } from "../../htmlvalidate";
import { type Report } from "../../reporter";

/** @todo this is cached without any mechanism to flush, this would typically
 * not be an issue but in watch mode this would cause issues if the
 * configuration is changed */
const state = {
	htmlvalidate: null as HtmlValidate | null,
};

const defaultConfig = defineConfig({
	rules: {
		"void-style": "off",
	},
});

function getValidator(): HtmlValidate {
	if (state.htmlvalidate === null) {
		const loader = new FileSystemConfigLoader({
			extends: ["html-validate:recommended"],
		});
		state.htmlvalidate = new HtmlValidate(loader);
	}
	return state.htmlvalidate;
}

export async function getReport(
	received: Report | string | Promise<Report> | Promise<string>,
	state: Pick<MatcherState, "testPath">,
): Promise<Report> {
	const resolved = await received;

	if (typeof resolved === "string") {
		const { testPath = "inline" } = state;
		const htmlvalidate = getValidator();
		return await htmlvalidate.validateString(resolved, testPath, defaultConfig);
	}

	return resolved;
}
