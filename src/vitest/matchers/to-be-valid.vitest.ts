import { describe, expect, it } from "vitest";
import { reportError, reportErrorAsync, reportOk, reportOkAsync } from "./__fixtures__";
import { toBeValid } from "./to-be-valid";

expect.extend({
	toBeValid: toBeValid(),
});

describe("toBeValid()", () => {
	it("should pass if report is valid", async () => {
		expect.assertions(1);
		await expect(reportOk()).toBeValid();
	});

	it("should pass if string is valid", async () => {
		expect.assertions(1);
		const markup = "<p></p>";
		await expect(markup).toBeValid();
	});

	it("should pass if async report is valid", async () => {
		expect.assertions(1);
		await expect(reportOkAsync()).toBeValid();
	});

	it("should pass if async string is valid", async () => {
		expect.assertions(1);
		const markup = Promise.resolve("<p></p>");
		await expect(markup).toBeValid();
	});

	it("should fail if report is invalid", async () => {
		expect.assertions(3);
		let error: Error | undefined;
		try {
			await expect(reportError()).toBeValid();
		} catch (e: unknown) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toMatchSnapshot();
	});

	it("should fail if string is invalid", async () => {
		expect.assertions(3);
		const markup = "<div>";
		let error: Error | undefined;
		try {
			await expect(markup).toBeValid();
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

	it("should fail if async string is invalid", async () => {
		expect.assertions(3);
		const markup = Promise.resolve("<div>");
		let error: Error | undefined;
		try {
			await expect(markup).toBeValid();
		} catch (e: unknown) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toMatchSnapshot();
	});
});
