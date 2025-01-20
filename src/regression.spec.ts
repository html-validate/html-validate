import { globSync } from "glob";
import { type Source } from "./context";
import { DynamicValue } from "./dom";
import { HtmlValidate } from "./htmlvalidate";
import { type AttributeData } from "./parser";
import { TRANSFORMER_API } from "./transform";
import { StaticConfigLoader, staticResolver } from "./browser";

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

const resolver = staticResolver({
	transformers: {
		"mock-transformer": transformer,
	},
});
const loader = new StaticConfigLoader([resolver], {
	root: true,
	extends: ["html-validate:recommended"],
	transform: {
		".*": "mock-transformer",
	},
});
const htmlvalidate = new HtmlValidate(loader);

describe("regression tests", () => {
	const files = globSync("test-files/issues/**/*.html", { posix: true });
	it.each(files)("%s", async (filename: string) => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile(filename);
		expect(report.results).toMatchSnapshot();
	});
});
