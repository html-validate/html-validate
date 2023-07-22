import { DynamicValue, HtmlElement } from "../dom";
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
		it("should not report error when meta is missing", () => {
			expect.assertions(1);
			const markup = [
				"<text-missing></text-missing>",
				"<text-missing>foobar</text-missing>",
				'<text-missing><span aria-label="foobar"></span></text-missing>',
			].join("");
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when textContent is unset", () => {
			expect.assertions(1);
			const markup = [
				"<text-unset></text-unset>",
				"<text-unset>foobar</text-unset>",
				'<text-unset><span aria-label="foobar"></span></text-unset>',
			].join("");
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("text none", () => {
		it("should not report when element is missing text", () => {
			expect.assertions(1);
			const markup = "<text-none></text-none>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report when element have only interelement whitespace", () => {
			expect.assertions(1);
			const markup = "<text-none>\n</text-none>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when element have static text", () => {
			expect.assertions(2);
			const markup = "<text-none>foobar</text-none>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError("text-content", "<text-none> must not have text content");
		});

		it("should report error when element have dynamic text", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString('<text-none bind-text="dynamic"></text-none>', {
				processElement,
			});
			expect(report).toBeInvalid();
			expect(report).toHaveError("text-content", "<text-none> must not have text content");
		});

		it("should report error when child element have static text", () => {
			expect.assertions(2);
			const markup = "<text-none><span>foobar</span></text-none>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError("text-content", "<text-none> must not have text content");
		});

		it("should report error when child element have dynamic text", () => {
			expect.assertions(2);
			const markup = '<text-none><span bind-text="dynamic"></span></text-none>';
			const report = htmlvalidate.validateString(markup, {
				processElement,
			});
			expect(report).toBeInvalid();
			expect(report).toHaveError("text-content", "<text-none> must not have text content");
		});
	});

	describe("text default", () => {
		it("should not report when element is missing text", () => {
			expect.assertions(1);
			const markup = "<text-default></text-default>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report when element have only interelement whitespace", () => {
			expect.assertions(1);
			const markup = "<text-default>\n</text-default>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when element have static text", () => {
			expect.assertions(1);
			const markup = "<text-default>foobar</text-default>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when element have dynamic text", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString(
				'<text-default bind-text="dynamic"></text-default>',
				{ processElement }
			);
			expect(report).toBeValid();
		});

		it("should not report error when child element have text", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString(
				"<text-default><span>foobar</span></text-default>"
			);
			expect(report).toBeValid();
		});
	});

	describe("text required", () => {
		it("should report when element is missing text", () => {
			expect.assertions(2);
			const markup = "<text-required></text-required>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError("text-content", "<text-required> must have text content");
		});

		it("should report when element have only interelement whitespace", () => {
			expect.assertions(2);
			const markup = "<text-required>\n</text-required>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError("text-content", "<text-required> must have text content");
		});

		it("should not report error when element have static text", () => {
			expect.assertions(1);
			const markup = "<text-required>foobar</text-required>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when element have dynamic text", () => {
			expect.assertions(1);
			const markup = '<text-required bind-text="dynamic"></text-required>';
			const report = htmlvalidate.validateString(markup, { processElement });
			expect(report).toBeValid();
		});

		it("should not report error when child element have static text", () => {
			expect.assertions(1);
			const markup = "<text-required><span>foobar</span></text-required>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when child element have dynamic text", () => {
			expect.assertions(1);
			const markup = '<text-required><span bind-text="dynamic">foobar</span></text-required>';
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("text accessible", () => {
		it("should report when element is missing text", () => {
			expect.assertions(2);
			const markup = "<text-accessible></text-accessible>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError("text-content", "<text-accessible> must have accessible text");
		});

		it("should report when element have only interelement whitespace", () => {
			expect.assertions(2);
			const markup = "<text-accessible>\n</text-accessible>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError("text-content", "<text-accessible> must have accessible text");
		});

		it("should report when children with text is aria-hidden", () => {
			expect.assertions(2);
			const markup = '<text-accessible><span aria-hidden="true">foobar</span></text-accessible>';
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError("text-content", "<text-accessible> must have accessible text");
		});

		describe("should report error when element has", () => {
			it.each`
				description                            | markup
				${"empty aria-label"}                  | ${'<text-accessible aria-label=""></text-accessible>'}
				${"empty aria-label (child)"}          | ${'<text-accessible><span aria-label=""></span></text-accessible>'}
				${"default text overwritten to empty"} | ${'<input type="submit" value="">'}
			`("$description", ({ markup }) => {
				expect.assertions(1);
				const report = htmlvalidate.validateString(markup);
				expect(report).toBeInvalid();
			});
		});

		it("should not report error when element have text", () => {
			expect.assertions(1);
			const markup = "<text-accessible>foobar</text-accessible>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when child element have text", () => {
			expect.assertions(1);
			const markup = "<text-accessible><span>foobar</span></text-accessible>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when element is aria-hidden", () => {
			expect.assertions(1);
			const markup = '<text-accessible aria-hidden="true"></text-accessible>';
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error parent is aria-hidden", () => {
			expect.assertions(1);
			const markup = '<div aria-hidden="true"><text-accessible></text-accessible></div>';
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when element have dynamic text", () => {
			expect.assertions(1);
			const markup = '<text-accessible bind-text="dynamic"></text-accessible>';
			const report = htmlvalidate.validateString(markup, { processElement });
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
			`("$description", ({ markup }) => {
				expect.assertions(1);
				const report = htmlvalidate.validateString(markup);
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
