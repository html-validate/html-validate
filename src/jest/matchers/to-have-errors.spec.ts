import { stripAnsi } from "../utils";
import { reportError, reportErrorAsync, reportMultipleErrors } from "./__fixtures__";
import "../jest";

describe("toHaveErrors()", () => {
	it("should pass if error is preset", () => {
		expect.assertions(1);
		expect(reportError()).toHaveErrors([["my-rule", "mock message"]]);
	});

	it("should pass if async error is preset", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-confusing-void-expression -- the types are wrong here, it does return a promise */
		await expect(reportErrorAsync()).toHaveErrors([["my-rule", "mock message"]]);
	});

	it("should pass if error have matching context", () => {
		expect.assertions(1);
		expect(reportError()).toHaveErrors([
			{ ruleId: "my-rule", message: "mock message", context: { foo: "bar" } },
		]);
	});

	it("should pass if all errors are preset", () => {
		expect.assertions(1);
		expect(reportMultipleErrors()).toHaveErrors([
			["my-rule", "mock message"],
			["another-rule", "another message"],
		]);
	});

	it("should fail if error any missing", () => {
		expect.assertions(3);
		let error: any;
		try {
			expect(reportMultipleErrors()).toHaveErrors([
				["my-rule", "mock message"],
				["spam", "spam"],
			]);
		} catch (e: any) {
			error = e;
		}
		expect(error).toBeDefined();
		/* eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- technical debt */
		expect(stripAnsi(error?.message ?? "")).toMatchSnapshot();
	});
});
