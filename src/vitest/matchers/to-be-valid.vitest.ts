import { describe, expect, it } from "vitest";
import { reportError, reportErrorAsync, reportOk, reportOkAsync } from "./__fixtures__";
import { toBeValid } from "./to-be-valid";

expect.extend({
	toBeValid: toBeValid(),
});

describe("toBeValid()", () => {
	it("should pass if report is valid", () => {
		expect.assertions(1);
		expect(reportOk()).toBeValid();
	});

	it("should pass if async report is valid", async () => {
		expect.assertions(1);
		await expect(reportOkAsync()).toBeValid();
	});

	it("should fail if report is invalid", () => {
		expect.assertions(3);
		let error: Error | undefined;
		try {
			expect(reportError()).toBeValid();
		} catch (e: unknown) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toMatchSnapshot();
	});

	it("should fail if async report is invalid", async () => {
		expect.assertions(3);
		let error: Error | undefined;
		try {
			await expect(reportErrorAsync()).toBeValid();
		} catch (e: unknown) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toMatchSnapshot();
	});
});
