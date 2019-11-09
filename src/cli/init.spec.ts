const fs = {
	existsSync: jest.fn(),
	writeFile: jest.fn().mockImplementation((fn, data, cb) => cb()),
};

const inquirer = {
	prompt: jest.fn(),
};

jest.mock("inquirer", () => inquirer);
jest.mock("fs", () => fs);

import { CLI } from "./cli";

let cli: CLI;
beforeEach(() => {
	jest.clearAllMocks();
	cli = new CLI();
});

it.each([
	["default", []],
	["angularjs", ["AngularJS"]],
	["vuejs", ["Vue.js"]],
	["markdown", ["Markdown"]],
	["combined", ["AngularJS", "Vue.js", "Markdown"]],
])("should generate configuration for %s", async (name, frameworks) => {
	expect.assertions(2);
	fs.existsSync.mockReturnValue(false);
	inquirer.prompt.mockResolvedValue({
		write: true,
		frameworks,
	});
	await cli.init(".");
	expect(fs.writeFile).toHaveBeenCalledWith(
		"./.htmlvalidate.json",
		expect.anything(),
		expect.anything()
	);
	expect(fs.writeFile.mock.calls[0][1]).toMatchSnapshot();
});

it("should not overwrite configuration unless requested", async () => {
	expect.assertions(1);
	fs.existsSync.mockReturnValue(true);
	inquirer.prompt.mockResolvedValue({
		write: false,
	});
	try {
		await cli.init(".");
	} catch (err) {
		/* do nothing */
	}
	expect(fs.writeFile).not.toHaveBeenCalled();
});

it("should always create configuration when config is missing", async () => {
	expect.assertions(1);
	fs.existsSync.mockReturnValue(false);
	inquirer.prompt.mockResolvedValue({
		write: undefined,
		frameworks: [],
	});
	await cli.init(".");
	expect(fs.writeFile).toHaveBeenCalledWith(
		"./.htmlvalidate.json",
		expect.anything(),
		expect.anything()
	);
});

it("should propagate errors from fs.writeFile", async () => {
	expect.assertions(1);
	fs.existsSync.mockReturnValue(false);
	fs.writeFile.mockImplementationOnce((fn, data, cb) => cb("mock error"));
	inquirer.prompt.mockResolvedValue({
		write: true,
		frameworks: [],
	});
	await expect(cli.init(".")).rejects.toEqual("mock error");
});
