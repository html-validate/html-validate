import { describe, expect, it } from "vitest";
import { reportError, reportErrorAsync, reportOk, reportOkAsync } from "./__fixtures__";
import { toBeInvalid } from "./to-be-invalid";

expect.extend({
	toBeInvalid: toBeInvalid(),
});

describe("toBeInvalid()", () => {
	it("should pass if report is invalid", async () => {
		expect.assertions(1);
		await expect(reportError()).toBeInvalid();
	});

	it("should pass if string is invalid", async () => {
		expect.assertions(1);
		const markup = "<div>";
		await expect(markup).toBeInvalid();
	});

	it("should pass if async report is invalid", async () => {
		expect.assertions(1);
		await expect(reportErrorAsync()).toBeInvalid();
	});

	it("should pass if async string is invalid", async () => {
		expect.assertions(1);
		const markup = Promise.resolve("<div>");
		await expect(markup).toBeInvalid();
	});

	it("should fail if report is valid", async () => {
		expect.assertions(3);
		let error: Error | undefined;
		try {
			await expect(reportOk()).toBeInvalid();
		} catch (e: unknown) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toMatchSnapshot();
	});

	it("should fail if string is valid", async () => {
		expect.assertions(3);
		const markup = "<p></p>";
		let error: Error | undefined;
		try {
			await expect(markup).toBeInvalid();
		} catch (e: unknown) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toMatchSnapshot();
	});

	it("should fail if async report is valid", async () => {
		expect.assertions(3);
		let error: Error | undefined;
		try {
			await expect(reportOkAsync()).toBeInvalid();
		} catch (e: unknown) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toMatchSnapshot();
	});

	it("should fail if async string is valid", async () => {
		expect.assertions(3);
		const markup = Promise.resolve("<p></p>");
		let error: Error | undefined;
		try {
			await expect(markup).toBeInvalid();
		} catch (e: unknown) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toMatchSnapshot();
	});
});
