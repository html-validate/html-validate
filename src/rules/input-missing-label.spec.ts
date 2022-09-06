import HtmlValidate from "../htmlvalidate";
import "../jest";

describe("rule input-missing-label", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "input-missing-label": "error" },
		});
	});

	it("should not report when input id has matching label", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for="foo"> foo </label>
			<input id="foo" />
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should not report when input type="hidden" is missing label', () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input type="hidden" /> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when input is nested inside label", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label>
				foo
				<input />
			</label>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when input is hidden", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input hidden /> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when input is aria-hidden", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input aria-hidden="true" /> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle multiple labels", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for="foo"> foo </label>
			<label for="foo"> bar </label>
			<input id="foo" />
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle colon in id", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for=":r1:">lorem ipsum</label>
			<input id=":r1:" />
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when at least one label is accessible", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for="foo" aria-hidden="true">foo</label>
			<label for="foo">bar</label>
			<input id="foo" />
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report when <input> is missing label", () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <input /> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <input> element does not have a <label> (input-missing-label) at inline:1:3:
			> 1 |  <input />
			    |   ^^^^^
			Selector: input"
		`);
	});

	it("should report when <textarea> is missing label", () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <textarea></textarea> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <textarea> element does not have a <label> (input-missing-label) at inline:1:3:
			> 1 |  <textarea></textarea>
			    |   ^^^^^^^^
			Selector: textarea"
		`);
	});

	it("should report when <select> is missing label", () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <select></select> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <select> element does not have a <label> (input-missing-label) at inline:1:3:
			> 1 |  <select></select>
			    |   ^^^^^^
			Selector: select"
		`);
	});

	it("should report error when label is hidden", () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<label for="foo" hidden></label>
			<input id="foo" />
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <input> element has label but <label> element is hidden (input-missing-label) at inline:3:5:
			  1 |
			  2 | 			<label for="foo" hidden></label>
			> 3 | 			<input id="foo" />
			    | 			 ^^^^^
			  4 |
			Selector: #foo"
		`);
	});

	it("should report error when label is aria-hidden", () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<label for="foo" aria-hidden="true"></label>
			<input id="foo" />
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <input> element has label but <label> element is hidden (input-missing-label) at inline:3:5:
			  1 |
			  2 | 			<label for="foo" aria-hidden="true"></label>
			> 3 | 			<input id="foo" />
			    | 			 ^^^^^
			  4 |
			Selector: #foo"
		`);
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/input-missing-label.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("input-missing-label")).toMatchSnapshot();
	});
});
