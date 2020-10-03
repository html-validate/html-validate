import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule no-unknown-elements", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-unknown-elements": "error" },
		});
	});

	it("should not report for known elements", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<div></div>");
		expect(report).toBeValid();
	});

	it("should report error for unknown elements", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<my-element></my-element>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("no-unknown-elements", "Unknown element <my-element>");
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("no-unknown-elements")).toMatchSnapshot();
	});

	it("should contain contextual documentation", () => {
		expect.assertions(1);
		expect(
			htmlvalidate.getRuleDocumentation("no-unknown-elements", null, "my-element")
		).toMatchSnapshot();
	});
});
