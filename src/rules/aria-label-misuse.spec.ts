import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule aria-label-misuse", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "aria-label-misuse": ["error"] },
		});
	});

	it("should not report for element without aria-label", () => {
		expect.assertions(1);
		const markup = "<p></p>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for element with empty aria-label", () => {
		expect.assertions(1);
		const markup = '<p aria-label=""></p>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for element with boolean aria-label", () => {
		expect.assertions(1);
		const markup = "<p aria-label></p>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for element without meta", () => {
		expect.assertions(1);
		const markup = '<custom-element aria-label="foobar"></custom-element>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for element with role", () => {
		expect.assertions(1);
		const markup = '<p aria-label="foobar" role="widget"></p>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	describe("should not report error for", () => {
		it.each`
			markup                                         | description
			${'<button aria-label="foobar"></button>'}     | ${"Interactive elements"}
			${'<input type="text" aria-label="foobar">'}   | ${"Labelable elements"}
			${'<main aria-label="foobar"></main>'}         | ${"Landmark elements"}
			${'<p role="widget" aria-label="foobar">'}     | ${'[role=".."]'}
			${'<p tabindex="0" aria-label="foobar"></p>'}  | ${"[tabindex]"}
			${'<area aria-label="foobar"></area>'}         | ${"<area>"}
			${'<form aria-label="foobar"></form>'}         | ${"<form>"}
			${'<fieldset aria-label="foobar"></fieldset>'} | ${"<fieldset>"}
			${'<iframe aria-label="foobar"></iframe>'}     | ${"<iframe>"}
			${'<img aria-label="foobar">'}                 | ${"<img>"}
			${'<figure aria-label="foobar"></figure>'}     | ${"<figure>"}
			${'<summary aria-label="foobar"></summary>'}   | ${"<summary>"}
			${'<table aria-label="foobar"></table>'}       | ${"<table>"}
			${'<td aria-label="foobar"></td>'}             | ${"<td>"}
			${'<th aria-label="foobar"></th>'}             | ${"<th>"}
		`("$description", ({ markup }) => {
			expect.assertions(1);
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	it("should report error when aria-label is used on invalid element", () => {
		expect.assertions(2);
		const markup = '<p aria-label="foobar"></p>';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("aria-label-misuse", '"aria-label" cannot be used on this element');
	});

	it("should report error when aria-label is used on input hidden", () => {
		expect.assertions(2);
		const markup = '<input type="hidden" aria-label="foobar">';
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("aria-label-misuse", '"aria-label" cannot be used on this element');
	});

	it("should handle dynamic attribute", () => {
		expect.assertions(2);
		const markup = '<p dynamic-aria-label="foobar"></p>';
		const report = htmlvalidate.validateString(markup, { processAttribute });
		expect(report).toBeInvalid();
		expect(report).toHaveError("aria-label-misuse", '"aria-label" cannot be used on this element');
	});

	it("should handle interpolated attribute", () => {
		expect.assertions(2);
		const markup = '<p aria-label="{{ interpolated }}"></p>';
		const report = htmlvalidate.validateString(markup, { processAttribute });
		expect(report).toBeInvalid();
		expect(report).toHaveError("aria-label-misuse", '"aria-label" cannot be used on this element');
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("aria-label-misuse")).toMatchSnapshot();
	});
});
