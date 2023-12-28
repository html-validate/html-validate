import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-self-closing", () => {
	let htmlvalidate: HtmlValidate;

	describe("default configuration", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "no-self-closing": "error" },
			});
		});

		it("should not report error when element has end tag", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<div></div>");
			expect(report).toBeValid();
		});

		it("should not report error for foreign elements", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<svg/>");
			expect(report).toBeValid();
		});

		it("should not report error for xml namespaces", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<xi:include/>");
			expect(report).toBeValid();
		});

		it("should not report error for void", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<input/>");
			expect(report).toBeValid();
		});

		it("should not report error when void element has end tag", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<input></input>");
			expect(report).toBeValid();
		});

		it("should report error when element is self-closed", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString("<div/>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-self-closing", "<div> must not be self-closed");
		});

		it("should report error for unknown elements", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString("<custom-element/>");
			expect(report).toHaveError("no-self-closing", "<custom-element> must not be self-closed");
		});
	});

	describe("ignoreForeign false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "no-self-closing": ["error", { ignoreForeign: false }] },
			});
		});

		it("should report error for foreign elements", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString("<svg/>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-self-closing", "<svg> must not be self-closed");
		});
	});

	describe("ignoreXML false", () => {
		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "no-self-closing": ["error", { ignoreXML: false }] },
			});
		});

		it("should report error for elements in xml namespace", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString("<xi:include/>");
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-self-closing", "<xi:include> must not be self-closed");
		});
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "no-self-closing": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("no-self-closing");
		expect(docs).toMatchSnapshot();
	});

	it("should contain contextual documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "no-self-closing": "error" },
		});
		const context = "div";
		const docs = await htmlvalidate.getRuleDocumentation("no-self-closing", null, context);
		expect(docs).toMatchSnapshot();
	});
});
