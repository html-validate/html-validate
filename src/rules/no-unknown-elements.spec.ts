import { HtmlValidate } from "../htmlvalidate";
import "../jest";

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

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("no-unknown-elements");
		expect(docs).toMatchSnapshot();
	});

	it("should contain contextual documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("no-unknown-elements", null, "my-element");
		expect(docs).toMatchSnapshot();
	});

	it("should only report error for included elements", () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			rules: {
				"no-unknown-elements": [
					"error",
					{
						include: ["bar-*"],
					},
				],
			},
		});
		const valid = htmlvalidate.validateString("<foo-element></foo-element>");
		const invalid = htmlvalidate.validateString("<bar-element></bar-element>");
		expect(valid).toMatchInlineCodeframe(`""`);
		expect(invalid).toMatchInlineCodeframe(`
			"error: Unknown element <bar-element> (no-unknown-elements) at inline:1:1:
			> 1 | <bar-element></bar-element>
			    | ^^^^^^^^^^^^
			Selector: bar-element"
		`);
	});

	it("should not report error for excluded elements", () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			rules: {
				"no-unknown-elements": [
					"error",
					{
						exclude: ["foo-*"],
					},
				],
			},
		});
		const valid = htmlvalidate.validateString("<foo-element></foo-element>");
		const invalid = htmlvalidate.validateString("<bar-element></bar-element>");
		expect(valid).toMatchInlineCodeframe(`""`);
		expect(invalid).toMatchInlineCodeframe(`
			"error: Unknown element <bar-element> (no-unknown-elements) at inline:1:1:
			> 1 | <bar-element></bar-element>
			    | ^^^^^^^^^^^^
			Selector: bar-element"
		`);
	});
});
