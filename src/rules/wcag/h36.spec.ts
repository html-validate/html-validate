import { HtmlValidate } from "../../htmlvalidate";
import "../../jest";

describe("wcag/h36", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h36": "error" },
		});
	});

	it("should not report when image has alt text", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<input type="image" alt="submit">');
		expect(report).toBeValid();
	});

	it("should not report on other input fields", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<input type="text">');
		expect(report).toBeValid();
	});

	it("should not report on other elements", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString('<p type="image"></p>');
		expect(report).toBeValid();
	});

	it("should report error when image is missing alt attribute", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<input type="image">');
		expect(report).toBeInvalid();
		expect(report).toHaveError("wcag/h36", "image used as submit button must have alt text");
	});

	it("should report error when image has empty alt text", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString('<input type="image" alt="">');
		expect(report).toBeInvalid();
		expect(report).toHaveError("wcag/h36", "image used as submit button must have alt text");
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h36": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("wcag/h36");
		expect(docs).toMatchSnapshot();
	});
});
