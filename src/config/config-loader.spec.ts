const glob = require("glob");
const files = glob.sync("test-files/config/**/*.html");
import { Config, ConfigLoader } from ".";
import HtmlValidate from "../htmlvalidate";

describe("ConfigLoader", () => {

	let loader: ConfigLoader;

	describe("smoketest", () => {

		beforeAll(() => {
			loader = new ConfigLoader(Config);
		});

		files.forEach((filename: string) => {
			it(filename, () => {
				const config = loader.fromTarget(filename);
				const htmlvalidate = new HtmlValidate(config);
				const report = htmlvalidate.validateFile(filename);
				expect(report.results).toMatchSnapshot();
			});
		});

	});

});
