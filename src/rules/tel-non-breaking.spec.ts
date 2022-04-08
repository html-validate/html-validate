import HtmlValidate from "../htmlvalidate";
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
		expect(report).toHaveError(
			"tel-non-breaking",
			'" " should be replaced with "&nbsp;" in telephone number'
		);
	});

	it("should report error when tel anchor have breaking hyphen", () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a href="tel:">foo-bar</a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"tel-non-breaking",
			'"-" should be replaced with "&#8209;" in telephone number'
		);
	});

	it("should report error in nested elements", () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a href="tel:"><span>foo bar</span></a>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"tel-non-breaking",
			'" " should be replaced with "&nbsp;" in telephone number'
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

	it("should report error withe correct location", () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<a href="tel:">
				<span> foo-bar </span>
			</a>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError({
			ruleId: "tel-non-breaking",
			line: 3,
			column: 15,
			size: 1,
		});
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
		const context = {
			pattern: " ",
			replacement: "&nbsp;",
			description: "non-breaking space",
		};
		expect(htmlvalidate.getRuleDocumentation("tel-non-breaking", null, context)).toMatchSnapshot();
	});
});
