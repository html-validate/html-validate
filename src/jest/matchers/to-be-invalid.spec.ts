import { describe, expect, it } from "@jest/globals";
import { reportError, reportErrorAsync, reportOk, reportOkAsync } from "./__fixtures__";
import "../jest";

describe("toBeInvalid()", () => {
	it("should pass if report is invalid", () => {
		expect.assertions(1);
		expect(reportError()).toBeInvalid();
	});

	it("should pass if async report is invalid", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-confusing-void-expression -- the types are wrong here, it does return a promise */
		await expect(reportErrorAsync()).toBeInvalid();
	});

	it("should fail if report is valid", () => {
		expect.assertions(3);
		let error: Error | undefined;
		try {
			expect(reportOk()).toBeInvalid();
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
			/* eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-confusing-void-expression -- the types are wrong here, it does return a promise */
			await expect(reportOkAsync()).toBeInvalid();
		} catch (e: unknown) {
			error = e as Error;
		}
		expect(error).toBeDefined();
		expect(error?.message).toMatchSnapshot();
	});
});
