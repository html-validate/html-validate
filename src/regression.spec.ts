import { readFileSync } from "fs";
import * as glob from "glob";
import { Source } from "./context";
import { DynamicValue } from "./dom";
import HtmlValidate from "./htmlvalidate";
import { AttributeData } from "./parser";

jest.mock(
	"mock-transformer",
	() => {
		return function transformer(filename: string) {
			const data = readFileSync(filename, { encoding: "utf-8" });
			const source: Source = {
				data,
				filename,
				line: 1,
				column: 1,
				hooks: {
					processAttribute(attr: AttributeData) {
						if (!attr.value) return;
						if (attr.key.startsWith("dynamic-")) {
							attr.originalAttribute = attr.key;
							attr.key = attr.key.replace("dynamic-", "");
							attr.value = new DynamicValue(attr.value as string);
						}
					},
				},
			};
			return [source];
		};
	},
	{ virtual: true }
);

describe("regression tests", () => {
	for (const filename of glob.sync("test-files/issues/**/*.html")) {
		it(filename, () => {
			const htmlvalidate = new HtmlValidate({
				extends: ["htmlvalidate:recommended"],
				transform: {
					".*": "mock-transformer",
				},
			});
			const report = htmlvalidate.validateFile(filename);
			expect(report.results).toMatchSnapshot();
		});
	}
});
