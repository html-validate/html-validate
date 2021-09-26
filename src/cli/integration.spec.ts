import path from "path";
import { CLI } from "./cli";

const root = path.resolve(__dirname, "../../");
const cli = new CLI();
const files = cli.expandFiles(["test-files/config"]).map((it) => path.relative(root, it));
const htmlvalidate = cli.getValidator();

it.each(files)("%s", (filename) => {
	expect.assertions(1);
	const report = htmlvalidate.validateFile(filename);
	expect(report).toMatchSnapshot();
});
