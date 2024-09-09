import path from "node:path";
import { type ConfigData } from "../config";
import { CLI } from "./cli";

const root = path.resolve(__dirname, "../../");
const cli = new CLI();

function filter(config: ConfigData): ConfigData {
	const cwd = process.cwd();
	if (config.elements) {
		config.elements = config.elements.map((it) => {
			return typeof it === "string" ? path.relative(cwd, it) : it;
		});
	}
	return config;
}

it("should match results", async () => {
	expect.hasAssertions();
	const htmlvalidate = await cli.getValidator();
	const files = await cli.expandFiles(["test-files/config"]);
	for (const filename of files) {
		const projectRelative = path.relative(root, filename);
		const config = await htmlvalidate.getConfigFor(projectRelative);
		const report = await htmlvalidate.validateFile(projectRelative);
		expect(filter(config.getConfigData())).toMatchSnapshot(`${projectRelative} config`);
		expect(report).toMatchSnapshot(`${projectRelative} result`);
	}
});
