import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-unknown-elements", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-unknown-elements": "error" },
		});
	});

	it("should not report for known elements", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error for unknown elements", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <my-element></my-element> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Unknown element <my-element> (no-unknown-elements) at inline:1:2:
			> 1 |  <my-element></my-element>
			    |  ^^^^^^^^^^^
			Selector: my-element"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("no-unknown-elements");
		expect(docs).toMatchSnapshot();
	});

	it("should contain contextual documentation", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("no-unknown-elements", null, "my-element");
		expect(docs).toMatchSnapshot();
	});

	it("should only report error for included elements", async () => {
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
		const valid = await htmlvalidate.validateString("<foo-element></foo-element>");
		const invalid = await htmlvalidate.validateString("<bar-element></bar-element>");
		expect(valid).toMatchInlineCodeframe(`""`);
		expect(invalid).toMatchInlineCodeframe(`
			"error: Unknown element <bar-element> (no-unknown-elements) at inline:1:1:
			> 1 | <bar-element></bar-element>
			    | ^^^^^^^^^^^^
			Selector: bar-element"
		`);
	});

	it("should not report error for excluded elements", async () => {
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
		const valid = await htmlvalidate.validateString("<foo-element></foo-element>");
		const invalid = await htmlvalidate.validateString("<bar-element></bar-element>");
		expect(valid).toMatchInlineCodeframe(`""`);
		expect(invalid).toMatchInlineCodeframe(`
			"error: Unknown element <bar-element> (no-unknown-elements) at inline:1:1:
			> 1 | <bar-element></bar-element>
			    | ^^^^^^^^^^^^
			Selector: bar-element"
		`);
	});
});
