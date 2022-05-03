import { reportOk, reportError } from "./__fixtures__";
import "../jest";

describe("toMatchCodeframe()", () => {
	it("should match valid report", () => {
		expect.assertions(1);
		expect(reportOk()).toMatchCodeframe();
	});

	it("should match valid string", () => {
		expect.assertions(1);
		expect("<p></p>").toMatchInlineCodeframe(`""`);
	});

	it("should match invalid report", () => {
		expect.assertions(1);
		expect(reportError()).toMatchCodeframe();
	});

	it("should match invalid string", () => {
		expect.assertions(1);
		expect("<p></i>").toMatchCodeframe();
	});
});
