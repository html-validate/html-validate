import path from "path";
import glob from "glob";
import { CLI } from "../src/cli/cli";

const fixtures = glob
	.sync(path.join(__dirname, "cli-*/*.html"))
	.map((filePath: string) => path.relative(__dirname, filePath));

it.each(fixtures)("%s", (filePath) => {
	expect.assertions(1);
	const cli = new CLI();
	const htmlvalidate = cli.getValidator();
	const report = htmlvalidate.validateFile(path.join(__dirname, filePath));
	const result = report.results[0];
	expect(result ? result.messages : []).toMatchSnapshot();
});
