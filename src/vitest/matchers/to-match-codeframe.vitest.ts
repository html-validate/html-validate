import { describe, expect, it } from "vitest";
import {
	reportError,
	reportErrorAsync,
	reportOk,
	reportOkAsync,
	reportWarning,
} from "./__fixtures__";
import { toMatchCodeframe } from "./to-match-codeframe";

expect.extend({
	toMatchCodeframe: toMatchCodeframe(),
});

describe("toMatchCodeframe()", () => {
	it("should match valid report", async () => {
		expect.assertions(1);
		await expect(reportOk()).toMatchCodeframe();
	});

	it("should match valid async report", async () => {
		expect.assertions(1);
		await expect(reportOkAsync()).toMatchCodeframe();
	});

	it("should match valid string", async () => {
		expect.assertions(1);
		await expect("<p></p>").toMatchCodeframe();
	});

	it("should match invalid report", async () => {
		expect.assertions(1);
		await expect(reportError()).toMatchCodeframe();
	});

	it("should match invalid async report", async () => {
		expect.assertions(1);
		await expect(reportErrorAsync()).toMatchCodeframe();
	});

	it("should match invalid string", async () => {
		expect.assertions(1);
		await expect("<div>").toMatchCodeframe();
	});

	it("should handle hint", async () => {
		expect.assertions(1);
		await expect(reportOk()).toMatchCodeframe("foobar");
	});

	it("should match warning report", async () => {
		expect.assertions(1);
		await expect(reportWarning()).toMatchCodeframe();
	});
});
