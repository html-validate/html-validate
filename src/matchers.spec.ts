import { Severity } from "./config";
import { Token, TokenType } from "./lexer";
import "./matchers";
import { Report, Reporter } from "./reporter";
import stripAnsi = require("strip-ansi");

let reportOk: Report;
let reportError: Report;
let reportMultipleErrors: Report;

beforeEach(() => {
	const reporter = new Reporter();
	reportOk = reporter.save();

	/* generate first report with a single error */
	reporter.addManual("inline", {
		ruleId: "my-rule",
		severity: Severity.ERROR,
		message: "mock message",
		line: 2,
		column: 15,
		offset: 43,
		size: 12,
		context: {
			foo: "bar",
		},
	});
	reportError = reporter.save();

	/* add another to the report with multiple errors */
	reporter.addManual("inline", {
		ruleId: "another-rule",
		severity: Severity.ERROR,
		message: "another message",
		line: 2,
		column: 15,
		offset: 43,
		size: 12,
	});
	reportMultipleErrors = reporter.save();
});

describe("toBeValid()", () => {
	it("should pass if report is valid", async () => {
		expect.assertions(1);
		await expect(reportOk).toBeValid();
	});

	it("should fail if report is invalid", async () => {
		expect.assertions(3);
		let error: Error;
		try {
			await expect(reportError).toBeValid();
		} catch (e) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(error.message).toMatchSnapshot();
	});
});

describe("toBeInvalid()", () => {
	it("should pass if report is invalid", async () => {
		expect.assertions(1);
		await expect(reportError).toBeInvalid();
	});

	it("should fail if report is valid", async () => {
		expect.assertions(3);
		let error: Error;
		try {
			await expect(reportOk).toBeInvalid();
		} catch (e) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(error.message).toMatchSnapshot();
	});
});

describe("toHaveError()", () => {
	it("should pass if error is preset", async () => {
		expect.assertions(1);
		await expect(reportError).toHaveError("my-rule", "mock message");
	});

	it("should pass if error have matching context", async () => {
		expect.assertions(1);
		await expect(reportError).toHaveError("my-rule", "mock message", {
			foo: "bar",
		});
	});

	it("should fail if error is missing", async () => {
		expect.assertions(3);
		let error: Error;
		try {
			await expect(reportError).toHaveError("asdf", "asdf");
		} catch (e) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error.message)).toMatchSnapshot();
	});

	it("should fail if error has mismatched context", async () => {
		expect.assertions(3);
		let error: Error;
		try {
			await expect(reportError).toHaveError("my-rule", "mock message", {
				foo: "spam",
			});
		} catch (e) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error.message)).toMatchSnapshot();
	});
});

describe("toHaveErrors()", () => {
	it("should pass if error is preset", async () => {
		expect.assertions(1);
		await expect(reportError).toHaveErrors([["my-rule", "mock message"]]);
	});

	it("should pass if error have matching context", async () => {
		expect.assertions(1);
		await expect(reportError).toHaveErrors([
			{ ruleId: "my-rule", message: "mock message", context: { foo: "bar" } },
		]);
	});

	it("should pass if all errors are preset", async () => {
		expect.assertions(1);
		await expect(reportMultipleErrors).toHaveErrors([
			["my-rule", "mock message"],
			["another-rule", "another message"],
		]);
	});

	it("should fail if error any missing", async () => {
		expect.assertions(3);
		let error: Error;
		try {
			await expect(reportMultipleErrors).toHaveErrors([
				["my-rule", "mock message"],
				["spam", "spam"],
			]);
		} catch (e) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error.message)).toMatchSnapshot();
	});
});

describe("toBeToken()", () => {
	const token: Token = {
		type: TokenType.TAG_OPEN,
		data: ["<foo", "", "foo"],
		location: {
			filename: "inline",
			line: 1,
			column: 2,
			offset: 1,
		},
	};

	it("should pass if token matches", async () => {
		expect.assertions(1);
		await expect({ value: token }).toBeToken({
			type: TokenType.TAG_OPEN,
		});
	});

	it("should fail if token doesn't match", async () => {
		expect.assertions(3);
		let error: Error;
		try {
			await expect({ value: token }).toBeToken({
				type: TokenType.TAG_CLOSE,
			});
		} catch (e) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error.message)).toMatchSnapshot();
	});
});
