import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule no-redundant-role", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-role": "error" },
		});
	});

	it("should not report error when element has non-redundant role", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<li role="presentation"></li>');
		expect(report).toBeValid();
	});

	it("should not report error element has no known roles", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<span role="main"></span>');
		expect(report).toBeValid();
	});

	it("should not report error when role is boolean", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString("<div role></div>");
		expect(report).toBeValid();
	});

	it("should not report error for dynamic attributes", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<input dynamic-role="main">', {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report error when element has redundant role", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-role": "error" },
		});
		const report = await htmlvalidate.validateString('<li role="listitem"></li>');
		expect(report).toBeInvalid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-role": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("no-redundant-role");
		expect(docs).toMatchSnapshot();
	});

	it("should contain contextual documentation", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "no-redundant-role": "error" },
		});
		const context = {
			role: "checkbox",
			tagname: "input",
		};
		const docs = await htmlvalidate.getRuleDocumentation("no-redundant-role", null, context);
		expect(docs).toMatchSnapshot();
	});
});
