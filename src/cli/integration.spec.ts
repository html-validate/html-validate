import path from "node:path";
import { CLI } from "./cli";

const root = path.resolve(__dirname, "../../");
const cli = new CLI();
const files = cli.expandFiles(["test-files/config"]).map((it) => path.relative(root, it));
const htmlvalidate = cli.getValidator();

it.each(files)("%s", async (filename) => {
	expect.assertions(1);
	const report = await htmlvalidate.validateFile(filename);
	expect(report).toMatchSnapshot();
});
