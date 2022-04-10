import { stripAnsi } from "../utils";
import { reportError, reportErrorAsync } from "./__fixtures__";
import "../jest";

describe("toHaveError()", () => {
	it("should pass if error is preset", () => {
		expect.assertions(1);
		expect(reportError()).toHaveError("my-rule", "mock message");
	});

	it("should pass if async error is preset", async () => {
		expect.assertions(1);
		await expect(reportErrorAsync()).toHaveError("my-rule", "mock message");
	});

	it("should pass if error have matching context", () => {
		expect.assertions(1);
		expect(reportError()).toHaveError("my-rule", "mock message", {
			foo: "bar",
		});
	});

	it("should fail if expected error is missing", () => {
		expect.assertions(3);
		let error: any;
		try {
			expect(reportError()).toHaveError("asdf", "asdf");
		} catch (e: any) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error?.message || "")).toMatchSnapshot();
	});

	it("should fail if error has mismatched context", async () => {
		expect.assertions(3);
		let error: any;
		try {
			await expect(reportError()).toHaveError("my-rule", "mock message", {
				foo: "spam",
			});
		} catch (e: any) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error?.message || "")).toMatchSnapshot();
	});

	it("should fail if expected async error is missing", async () => {
		expect.assertions(3);
		let error: any;
		try {
			await expect(reportErrorAsync()).toHaveError("asdf", "asdf");
		} catch (e: any) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error?.message || "")).toMatchSnapshot();
	});

	it("should handle passing object as expected error", () => {
		expect.assertions(3);
		let error: any;
		try {
			expect(reportError()).toHaveError({
				ruleId: "asdf",
				line: 3,
				size: 12,
			});
		} catch (e: any) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(stripAnsi(error?.message || "")).toMatchSnapshot();
	});
});
