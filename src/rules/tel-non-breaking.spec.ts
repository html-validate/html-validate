import { HtmlValidate } from "../htmlvalidate";
import { type RuleContext } from "./tel-non-breaking";
import "../jest";

describe("rule tel-non-breaking", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"tel-non-breaking": [
					"error",
					{
						ignoreClasses: ["nobreak"],
					},
				],
			},
		});
	});

	it("should not report error for other elements", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<span>foo bar - baz</div>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when anchor is not tel", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a href="/">foo bar - baz</a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when tel anchor is using only allowed characters", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a href="tel:">foo&nbsp;bar&8209;baz</a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when anchor is ignored by class", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a href="tel:" class="nobreak">foo bar-baz</a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when anchor has white-space: nowrap", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a href="tel:" style="white-space: nowrap">foo bar-baz</a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when anchor has white-space: pre", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a href="tel:" style="white-space: pre">foo bar-baz</a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when tel anchor have breaking space", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a href="tel:">foo bar</a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: " " should be replaced with "&nbsp;" (non-breaking space) in telephone number (tel-non-breaking) at inline:1:19:
			> 1 | <a href="tel:">foo bar</a>
			    |                   ^
			Selector: a"
		`);
	});

	it("should report error when tel anchor have breaking hyphen", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a href="tel:">foo-bar</a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "-" should be replaced with "&#8209;" (non-breaking hyphen) in telephone number (tel-non-breaking) at inline:1:19:
			> 1 | <a href="tel:">foo-bar</a>
			    |                   ^
			Selector: a"
		`);
	});

	it("should report error when anchor has white-space set to other values", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a href="tel:" style="white-space: normal">foo ba</a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: " " should be replaced with "&nbsp;" (non-breaking space) in telephone number (tel-non-breaking) at inline:1:47:
			> 1 | <a href="tel:" style="white-space: normal">foo ba</a>
			    |                                               ^
			Selector: a"
		`);
	});

	it("should report error when ignoreStyle is disabled", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			root: true,
			rules: {
				"tel-non-breaking": [
					"error",
					{
						ignoreStyle: false,
					},
				],
			},
		});
		const markup = /* HTML */ `<a href="tel:" style="white-space: nowrap">foo bar</a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: " " should be replaced with "&nbsp;" (non-breaking space) in telephone number (tel-non-breaking) at inline:1:47:
			> 1 | <a href="tel:" style="white-space: nowrap">foo bar</a>
			    |                                               ^
			Selector: a"
		`);
	});

	it("should report error when anchor has unrelated styling", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a href="tel:" style="background: red">foo ba</a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: " " should be replaced with "&nbsp;" (non-breaking space) in telephone number (tel-non-breaking) at inline:1:43:
			> 1 | <a href="tel:" style="background: red">foo ba</a>
			    |                                           ^
			Selector: a"
		`);
	});

	it("should report error in nested elements", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a href="tel:"><span>foo bar</span></a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: " " should be replaced with "&nbsp;" (non-breaking space) in telephone number (tel-non-breaking) at inline:1:25:
			> 1 | <a href="tel:"><span>foo bar</span></a>
			    |                         ^
			Selector: a"
		`);
	});

	it("should ignore interelement whitespace", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<a href="tel:">
				<span> foobar </span>
			</a>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "tel-non-breaking": "error" },
		});
		const context: RuleContext = {
			pattern: " ",
			replacement: "&nbsp;",
			description: "non-breaking space",
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "tel-non-breaking",
			context,
		});
		expect(docs).toMatchInlineSnapshot(`
			{
			  "description": "The \` \` character should be replaced with \`&nbsp;\` character (non-breaking space) when used in a telephone number.

			Unless non-breaking characters is used there could be a line break inserted at that character.
			Line breaks make is harder to read and understand the telephone number.

			The following characters should be avoided:

			  - \` \` - replace with \`&nbsp;\` (non-breaking space).
			  - \`-\` - replace with \`&#8209;\` (non-breaking hyphen).",
			  "url": "https://html-validate.org/rules/tel-non-breaking.html",
			}
		`);
	});
});
