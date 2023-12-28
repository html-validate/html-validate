import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule element-permitted-order", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "element-permitted-order": "error" },
		});
	});

	it("should report error when child is used in wrong order", async () => {
		expect.assertions(2);
		const report = await htmlvalidate.validateString(
			"<table><thead></thead><caption></caption></table>",
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"element-permitted-order",
			"Element <caption> must be used before <thead> in this context",
		);
	});

	it("should not report error when child is used in right order", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString(
			"<table><caption></caption><thead></thead></table>",
		);
		expect(report).toBeValid();
	});

	it("should not report error when disallowed child is used", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<table><foo></foo></table>");
		expect(report).toBeValid();
	});

	it("should not report error when child with unspecified order is used", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString(
			"<table><caption></caption><template></template><thead></thead></table>",
		);
		expect(report).toBeValid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("element-permitted-order");
		expect(docs).toMatchSnapshot();
	});
});
