import { Report } from "../reporter";
import { CLI } from "./cli";

/* all mocked formatters must return empty string */
const textFormatter = jest.fn((report: Report) => ""); // eslint-disable-line @typescript-eslint/no-unused-vars
const jsonFormatter = jest.fn((report: Report) => ""); // eslint-disable-line @typescript-eslint/no-unused-vars

jest.mock("../formatters/text", () => {
	return (report: Report) => textFormatter(report);
});

jest.mock("../formatters/json", () => {
	return (report: Report) => jsonFormatter(report);
});

const fs = {
	existsSync: jest.fn().mockReturnValue(true),
	mkdirSync: jest.fn(),
	writeFileSync: jest.fn(),
};

jest.mock("fs", () => {
	return {
		existsSync: (...args: any[]) => fs.existsSync(...args),
		mkdirSync: (...args: any[]) => fs.mkdirSync(...args),
		writeFileSync: (...args: any[]) => fs.writeFileSync(...args),
	};
});

const report: Report = {
	valid: false,
	results: [
		{
			messages: [
				{
					ruleId: "foo",
					severity: 2,
					message: "lorem ipsum",
					offset: 1,
					line: 1,
					column: 2,
					size: 1,
				},
			],
			filePath: "mock-file.html",
			errorCount: 1,
			warningCount: 0,
		},
	],
	errorCount: 1,
	warningCount: 0,
};

let cli: CLI;

beforeEach(() => {
	cli = new CLI();
});

describe("cli/formatters", () => {
	it("should call formatter", () => {
		const wrapped = cli.getFormatter("text");
		wrapped(report);
		expect(textFormatter).toHaveBeenCalledWith(report.results);
	});

	it("should call multiple formatters", () => {
		const wrapped = cli.getFormatter("text,json");
		wrapped(report);
		expect(textFormatter).toHaveBeenCalledWith(report.results);
		expect(jsonFormatter).toHaveBeenCalledWith(report.results);
	});

	it("should redirect output to file", () => {
		const wrapped = cli.getFormatter("text=foo.txt");
		wrapped(report);
		expect(fs.mkdirSync).not.toHaveBeenCalled();
		expect(fs.writeFileSync).toHaveBeenCalledWith("foo.txt", "", "utf-8");
	});

	it("should create directory if missing", () => {
		fs.existsSync.mockReturnValue(false);
		const wrapped = cli.getFormatter("text=mydir/foo.txt");
		wrapped(report);
		expect(fs.mkdirSync).toHaveBeenCalledWith("mydir", { recursive: true });
		expect(fs.writeFileSync).toHaveBeenCalledWith("mydir/foo.txt", "", "utf-8");
	});
});
