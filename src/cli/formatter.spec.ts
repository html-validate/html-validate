import fs from "fs";
import { vol } from "memfs";
import { type Report } from "../reporter";
import { CLI } from "./cli";

jest.mock("fs");

jest.mock(
	"custom-formatter",
	() => {
		return () => "custom formater";
	},
	{ virtual: true },
);

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
					selector: null,
				},
			],
			filePath: "mock-file.html",
			errorCount: 1,
			warningCount: 0,
			source: null,
		},
	],
	errorCount: 1,
	warningCount: 0,
};

let cli: CLI;

beforeEach(() => {
	vol.fromJSON({
		"./package.json": "{}",
	});
	cli = new CLI();
});

describe("cli/formatters", () => {
	it("should call formatter", () => {
		expect.assertions(1);
		const wrapped = cli.getFormatter("text");
		const output = wrapped(report);
		expect(output).toMatchInlineSnapshot(`
			"mock-file.html:1:2: error [foo] lorem ipsum
			"
		`);
	});

	it("should call multiple formatters", () => {
		expect.assertions(1);
		const wrapped = cli.getFormatter("text,json");
		const output = wrapped(report);
		expect(output).toMatchInlineSnapshot(`
			"mock-file.html:1:2: error [foo] lorem ipsum

			[{"messages":[{"ruleId":"foo","severity":2,"message":"lorem ipsum","offset":1,"line":1,"column":2,"size":1,"selector":null}],"filePath":"mock-file.html","errorCount":1,"warningCount":0,"source":null}]"
		`);
	});

	it("should call custom formatter", () => {
		expect.assertions(1);
		const wrapped = cli.getFormatter("custom-formatter");
		const output = wrapped(report);
		expect(output).toMatchInlineSnapshot(`"custom formater"`);
	});

	it("should redirect output to file", () => {
		expect.assertions(2);
		const wrapped = cli.getFormatter("text=foo.txt");
		const output = wrapped(report);
		expect(output).toMatchInlineSnapshot(`""`);
		expect(fs.readFileSync("foo.txt", "utf-8")).toMatchInlineSnapshot(`
			"mock-file.html:1:2: error [foo] lorem ipsum
			"
		`);
	});

	it("should create directory if missing", () => {
		expect.assertions(1);
		const wrapped = cli.getFormatter("text=mydir/foo.txt");
		wrapped(report);
		expect(fs.readFileSync("mydir/foo.txt", "utf-8")).toMatchInlineSnapshot(`
			"mock-file.html:1:2: error [foo] lorem ipsum
			"
		`);
	});

	it("should throw error when formatter is missing", () => {
		expect.assertions(1);
		expect(() => cli.getFormatter("missing")).toThrow('No formatter named "missing"');
	});
});
