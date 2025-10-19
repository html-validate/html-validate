import { reportError, reportErrorAsync, reportOk, reportOkAsync } from "./__fixtures__";
import "../jest";

describe("toBeValid()", () => {
	it("should pass if report is valid", () => {
		expect.assertions(1);
		expect(reportOk()).toBeValid();
	});

	it("should pass if async report is valid", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-confusing-void-expression -- the types are wrong here, it does return a promise */
		await expect(reportOkAsync()).toBeValid();
	});

	it("should fail if report is invalid", () => {
		expect.assertions(3);
		let error: any;
		try {
			expect(reportError()).toBeValid();
		} catch (e: any) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(error?.message).toMatchSnapshot();
	});

	it("should fail if async report is invalid", async () => {
		expect.assertions(3);
		let error: any;
		try {
			/* eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-confusing-void-expression -- the types are wrong here, it does return a promise */
			await expect(reportErrorAsync()).toBeValid();
		} catch (e: any) {
			error = e;
		}
		expect(error).toBeDefined();
		expect(error?.message).toMatchSnapshot();
	});
});
