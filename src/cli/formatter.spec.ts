import { getFormatter } from "./formatter";
import { Report } from "../reporter";

/* all mocked formatters must return empty string */
const textFormatter = jest.fn(() => "");
const jsonFormatter = jest.fn(() => "");

jest.mock("../formatters/text", () => {
	return (report: Report) => textFormatter(report);
});

jest.mock("../formatters/json", () => {
	return (report: Report) => jsonFormatter(report);
});

const writeFileSync = jest.fn();
jest.mock("fs", () => {
	return {
		writeFileSync: (...args: any[]) => writeFileSync(...args),
	};
});

const report: Report = {
	valid: false,
	results: [
		{
			messages: [
				{ruleId: "foo", severity: 2, message: "lorem ipsum", offset: 1, line: 1, column: 2, size: 1},
			],
			filePath: "mock-file.html",
			errorCount: 1,
			warningCount: 0,
		},
	],
};

describe("cli/formatters", () => {

	it("should call formatter", () => {
		const wrapped = getFormatter("text");
		wrapped(report);
		expect(textFormatter).toHaveBeenCalledWith(report.results);
	});

	it("should call multiple formatters", () => {
		const wrapped = getFormatter("text,json");
		wrapped(report);
		expect(textFormatter).toHaveBeenCalledWith(report.results);
		expect(jsonFormatter).toHaveBeenCalledWith(report.results);
	});

	it("should redirect output", () => {
		const wrapped = getFormatter("text=foo.txt");
		wrapped(report);
		expect(writeFileSync).toHaveBeenCalledWith("foo.txt", "", "utf-8");
	});

});
