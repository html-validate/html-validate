import * as glob from "glob";
import HtmlValidate from "./htmlvalidate";

describe("regression tests", () => {
	for (const filename of glob.sync("test-files/issues/**/*.html")) {
		it(filename, () => {
			const htmlvalidate = new HtmlValidate();
			const report = htmlvalidate.validateFile(filename);
			expect(report.results).toMatchSnapshot();
		});
	}
});
