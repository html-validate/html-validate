import { describe, expect, it } from "@jest/globals";
import { reportError, reportErrorAsync, reportOk, reportOkAsync } from "./__fixtures__";
import "../jest";

describe("toMatchCodeframe()", () => {
	it("should match valid report", () => {
		expect.assertions(1);
		expect(reportOk()).toMatchCodeframe();
	});

	it("should match valid async report", () => {
		expect.assertions(1);
		expect(reportOkAsync()).toMatchCodeframe();
	});

	it("should match valid string", () => {
		expect.assertions(1);
		expect("<p></p>").toMatchCodeframe();
	});

	it("should match invalid report", () => {
		expect.assertions(1);
		expect(reportError()).toMatchCodeframe();
	});

	it("should match invalid async report", () => {
		expect.assertions(1);
		expect(reportErrorAsync()).toMatchCodeframe();
	});

	it("should match invalid string", () => {
		expect.assertions(1);
		expect("<div>").toMatchCodeframe();
	});

	it("should handle hint", () => {
		expect.assertions(1);
		expect(reportOk()).toMatchCodeframe("foobar");
	});
});
