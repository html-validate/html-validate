import kleur from "kleur";
import HtmlValidate from "../htmlvalidate";
import { codeframe } from "../formatters/codeframe";
import { type RuleContext } from "./tel-non-breaking";
import "../jest";

kleur.enabled = false;

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
		expect(report).toHaveError(
			"tel-non-breaking",
			'" " should be replaced with "&nbsp;" (non-breaking space) in telephone number'
		);
	});

	it("should report error when tel anchor have breaking hyphen", () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a href="tel:">foo-bar</a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"tel-non-breaking",
			'"-" should be replaced with "&#8209;" (non-breaking hyphen) in telephone number'
		);
	});

	it("should report error in nested elements", () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a href="tel:"><span>foo bar</span></a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"tel-non-breaking",
			'" " should be replaced with "&nbsp;" (non-breaking space) in telephone number'
		);
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

	it("should report proper location and selector", () => {
		expect.assertions(3);
		const markup = /* HTML */ `
			<body>
				<header>
					<a href="tel:">
						<span> foo-bar </span>
					</a>
				</header>
			</body>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError({
			selector: "body > header > a",
		});
		expect(codeframe(report.results, { showLink: false, showSummary: false })).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "tel-non-breaking": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("tel-non-breaking")).toMatchSnapshot();
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
		expect(htmlvalidate.getRuleDocumentation("tel-non-breaking", null, context)).toMatchSnapshot();
	});
});
