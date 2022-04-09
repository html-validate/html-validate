import HtmlValidate from "../htmlvalidate";
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

	it("should not report error for other elements", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<span>foo bar - baz</div>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when anchor is not tel", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a href="/">foo bar - baz</a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when tel anchor is using only allowed characters", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a href="tel:">foo&nbsp;bar&8209;baz</a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when anchor is ignored by class", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a href="tel:" class="nobreak">foo bar-baz</a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when tel anchor have breaking space", () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a href="tel:">foo bar</a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: \\" \\" should be replaced with \\"&nbsp;\\" (non-breaking space) in telephone number (tel-non-breaking) at inline:1:19:
			> 1 | <a href=\\"tel:\\">foo bar</a>
			    |                   ^
			Selector: a"
		`);
	});

	it("should report error when tel anchor have breaking hyphen", () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a href="tel:">foo-bar</a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: \\"-\\" should be replaced with \\"&#8209;\\" (non-breaking hyphen) in telephone number (tel-non-breaking) at inline:1:19:
			> 1 | <a href=\\"tel:\\">foo-bar</a>
			    |                   ^
			Selector: a"
		`);
	});

	it("should report error in nested elements", () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a href="tel:"><span>foo bar</span></a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: \\" \\" should be replaced with \\"&nbsp;\\" (non-breaking space) in telephone number (tel-non-breaking) at inline:1:25:
			> 1 | <a href=\\"tel:\\"><span>foo bar</span></a>
			    |                         ^
			Selector: a"
		`);
	});

	it("should ignore interelement whitespace", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<a href="tel:">
				<span> foobar </span>
			</a>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "tel-non-breaking": "error" },
		});
		const docs = htmlvalidate.getRuleDocumentation("tel-non-breaking");
		expect(docs).toMatchInlineSnapshot(`
			Object {
			  "description": "Replace this character with a non-breaking version.

			Unless non-breaking characters is used there could be a line break inserted at that character.
			Line breaks make is harder to read and understand the telephone number.

			The following characters should be avoided:

			  - \` \` - replace with \`&nbsp;\` (non-breaking space).
			  - \`-\` - replace with \`&#8209;\` (non-breaking hyphen).",
			  "url": "https://html-validate.org/rules/tel-non-breaking.html",
			}
		`);
	});

	it("should contain contextual documentation", () => {
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
		const docs = htmlvalidate.getRuleDocumentation("tel-non-breaking", null, context);
		expect(docs).toMatchInlineSnapshot(`
			Object {
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
