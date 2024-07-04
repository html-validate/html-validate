import { type HtmlElement, DynamicValue } from "../dom";
import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { TextContent } from "../meta";

function processElement(node: HtmlElement): void {
	if (node.hasAttribute("bind-text")) {
		node.appendText(new DynamicValue(""), {
			filename: "mock",
			line: 1,
			column: 1,
			offset: 0,
			size: 1,
		});
	}
}

describe("rule text-content", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			elements: [
				{
					"text-unset": {},
					"text-none": {
						textContent: TextContent.NONE,
					},
					"text-default": {
						textContent: TextContent.DEFAULT,
					},
					"text-required": {
						textContent: TextContent.REQUIRED,
					},
					"text-accessible": {
						textContent: TextContent.ACCESSIBLE,
					},
					input: {
						void: true,
						textContent: TextContent.ACCESSIBLE,
					},
				},
			],
			rules: { "text-content": "error" },
		});
	});

	describe("text unset", () => {
		it("should not report error when meta is missing", async () => {
			expect.assertions(1);
			const markup = [
				"<text-missing></text-missing>",
				"<text-missing>foobar</text-missing>",
				'<text-missing><span aria-label="foobar"></span></text-missing>',
			].join("");
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when textContent is unset", async () => {
			expect.assertions(1);
			const markup = [
				"<text-unset></text-unset>",
				"<text-unset>foobar</text-unset>",
				'<text-unset><span aria-label="foobar"></span></text-unset>',
			].join("");
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("text none", () => {
		it("should not report when element is missing text", async () => {
			expect.assertions(1);
			const markup = "<text-none></text-none>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report when element have only interelement whitespace", async () => {
			expect.assertions(1);
			const markup = "<text-none>\n</text-none>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when element have static text", async () => {
			expect.assertions(2);
			const markup = "<text-none>foobar</text-none>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <text-none> must not have text content (text-content) at inline:1:2:
				> 1 | <text-none>foobar</text-none>
				    |  ^^^^^^^^^
				Selector: text-none"
			`);
		});

		it("should report error when element have dynamic text", async () => {
			expect.assertions(2);
			const markup = /* HTML */ ` <text-none bind-text="dynamic"></text-none> `;
			const report = await htmlvalidate.validateString(markup, {
				processElement,
			});
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <text-none> must not have text content (text-content) at inline:1:3:
				> 1 |  <text-none bind-text="dynamic"></text-none>
				    |   ^^^^^^^^^
				Selector: text-none"
			`);
		});

		it("should report error when child element have static text", async () => {
			expect.assertions(2);
			const markup = "<text-none><span>foobar</span></text-none>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <text-none> must not have text content (text-content) at inline:1:2:
				> 1 | <text-none><span>foobar</span></text-none>
				    |  ^^^^^^^^^
				Selector: text-none"
			`);
		});

		it("should report error when child element have dynamic text", async () => {
			expect.assertions(2);
			const markup = '<text-none><span bind-text="dynamic"></span></text-none>';
			const report = await htmlvalidate.validateString(markup, {
				processElement,
			});
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <text-none> must not have text content (text-content) at inline:1:2:
				> 1 | <text-none><span bind-text="dynamic"></span></text-none>
				    |  ^^^^^^^^^
				Selector: text-none"
			`);
		});
	});

	describe("text default", () => {
		it("should not report when element is missing text", async () => {
			expect.assertions(1);
			const markup = "<text-default></text-default>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report when element have only interelement whitespace", async () => {
			expect.assertions(1);
			const markup = "<text-default>\n</text-default>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when element have static text", async () => {
			expect.assertions(1);
			const markup = "<text-default>foobar</text-default>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when element have dynamic text", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <text-default bind-text="dynamic"></text-default> `;
			const report = await htmlvalidate.validateString(markup, { processElement });
			expect(report).toBeValid();
		});

		it("should not report error when child element have text", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <text-default><span>foobar</span></text-default> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("text required", () => {
		it("should report when element is missing text", async () => {
			expect.assertions(2);
			const markup = "<text-required></text-required>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <text-required> must have text content (text-content) at inline:1:2:
				> 1 | <text-required></text-required>
				    |  ^^^^^^^^^^^^^
				Selector: text-required"
			`);
		});

		it("should report when element have only interelement whitespace", async () => {
			expect.assertions(2);
			const markup = "<text-required>\n</text-required>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <text-required> must have text content (text-content) at inline:1:2:
				> 1 | <text-required>
				    |  ^^^^^^^^^^^^^
				  2 | </text-required>
				Selector: text-required"
			`);
		});

		it("should not report error when element have static text", async () => {
			expect.assertions(1);
			const markup = "<text-required>foobar</text-required>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when element have dynamic text", async () => {
			expect.assertions(1);
			const markup = '<text-required bind-text="dynamic"></text-required>';
			const report = await htmlvalidate.validateString(markup, { processElement });
			expect(report).toBeValid();
		});

		it("should not report error when child element have static text", async () => {
			expect.assertions(1);
			const markup = "<text-required><span>foobar</span></text-required>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when child element have dynamic text", async () => {
			expect.assertions(1);
			const markup = '<text-required><span bind-text="dynamic">foobar</span></text-required>';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("text accessible", () => {
		it("should report when element is missing text", async () => {
			expect.assertions(2);
			const markup = "<text-accessible></text-accessible>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <text-accessible> must have accessible text (text-content) at inline:1:2:
				> 1 | <text-accessible></text-accessible>
				    |  ^^^^^^^^^^^^^^^
				Selector: text-accessible"
			`);
		});

		it("should report when element have only interelement whitespace", async () => {
			expect.assertions(2);
			const markup = "<text-accessible>\n</text-accessible>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <text-accessible> must have accessible text (text-content) at inline:1:2:
				> 1 | <text-accessible>
				    |  ^^^^^^^^^^^^^^^
				  2 | </text-accessible>
				Selector: text-accessible"
			`);
		});

		it("should report when children with text is aria-hidden", async () => {
			expect.assertions(2);
			const markup = '<text-accessible><span aria-hidden="true">foobar</span></text-accessible>';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <text-accessible> must have accessible text (text-content) at inline:1:2:
				> 1 | <text-accessible><span aria-hidden="true">foobar</span></text-accessible>
				    |  ^^^^^^^^^^^^^^^
				Selector: text-accessible"
			`);
		});

		describe("should report error when element has", () => {
			it.each`
				description                            | markup
				${"empty aria-label"}                  | ${'<text-accessible aria-label=""></text-accessible>'}
				${"empty aria-label (child)"}          | ${'<text-accessible><span aria-label=""></span></text-accessible>'}
				${"default text overwritten to empty"} | ${'<input type="submit" value="">'}
			`("$description", async ({ markup }) => {
				expect.assertions(1);
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeInvalid();
			});
		});

		it("should not report error when element have text", async () => {
			expect.assertions(1);
			const markup = "<text-accessible>foobar</text-accessible>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when child element have text", async () => {
			expect.assertions(1);
			const markup = "<text-accessible><span>foobar</span></text-accessible>";
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when element is aria-hidden", async () => {
			expect.assertions(1);
			const markup = '<text-accessible aria-hidden="true"></text-accessible>';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error parent is aria-hidden", async () => {
			expect.assertions(1);
			const markup = '<div aria-hidden="true"><text-accessible></text-accessible></div>';
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when element have dynamic text", async () => {
			expect.assertions(1);
			const markup = '<text-accessible bind-text="dynamic"></text-accessible>';
			const report = await htmlvalidate.validateString(markup, { processElement });
			expect(report).toBeValid();
		});

		describe("should not report error when element has", () => {
			it.each`
				description                               | markup
				${"aria-label"}                           | ${'<text-accessible aria-label="foobar"></text-accessible>'}
				${"aria-label (child)"}                   | ${'<text-accessible><span aria-label="foobar"></span></text-accessible>'}
				${"aria-labelledby"}                      | ${'<text-accessible aria-labelledby="reference"></text-accessible>'}
				${"aria-labelledby (child)"}              | ${'<text-accessible><span aria-labelledby="reference"></span></text-accessible>'}
				${"img with alt text"}                    | ${'<text-accessible><img alt="foobar"></img></text-accessible>'}
				${'default text (<input type="submit">)'} | ${'<input type="submit">'}
				${'default text (<input type="reset">)'}  | ${'<input type="reset">'}
			`("$description", async ({ markup }) => {
				expect.assertions(1);
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			});
		});
	});

	describe("should contain documentation", () => {
		it.each(Object.values(TextContent))("%s", async (textContent: string) => {
			expect.assertions(1);
			const context = {
				tagName: "my-element",
				textContent,
			};
			const docs = await htmlvalidate.getContextualDocumentation({
				ruleId: "text-content",
				context,
			});
			expect(docs).toMatchSnapshot();
		});
	});
});
