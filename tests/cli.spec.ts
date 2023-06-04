import * as path from "path";
import { globSync } from "glob";
import { CLI } from "../src/cli/cli";

const fixtures = globSync("cli-*/*.html", { cwd: __dirname });

it.each(fixtures)("%s", async (filePath) => {
	expect.assertions(1);
	const cli = new CLI();
	const htmlvalidate = cli.getValidator();
	const report = await htmlvalidate.validateFile(path.join(__dirname, filePath));
	const result = report.results[0];
	expect(result ? result.messages : []).toMatchSnapshot();
});
