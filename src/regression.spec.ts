import glob from "glob";
import { Source } from "./context";
import { DynamicValue } from "./dom";
import HtmlValidate from "./htmlvalidate";
import { AttributeData } from "./parser";
import { Transformer, TRANSFORMER_API } from "./transform";

jest.mock(
	"mock-transformer",
	() => {
		function transformer(source: Source): Iterable<Source> {
			source.hooks = {
				*processAttribute(attr: AttributeData) {
					yield attr;
					if (attr.key.startsWith("dynamic-")) {
						yield {
							key: attr.key.replace("dynamic-", ""),
							value: new DynamicValue(attr.value as string),
							quote: attr.quote,
							originalAttribute: attr.key,
						};
					}
				},
			};
			return [source];
		}
		transformer.api = TRANSFORMER_API.VERSION;
		return transformer as Transformer;
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
