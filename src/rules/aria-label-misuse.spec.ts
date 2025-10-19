import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule aria-label-misuse", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			elements: [
				"html5",
				{
					"custom-allowed": {
						attributes: {
							"aria-label": {},
						},
					},
					"custom-disallowed": {
						attributes: {},
					},
				},
			],
			rules: { "aria-label-misuse": ["error"] },
		});
	});

	it("should not report for element without aria-label", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for element with empty aria-label", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p aria-label=""></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for element with boolean aria-label", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p aria-label></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for element without meta", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <custom-element aria-label="foobar"></custom-element> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for element with role", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p aria-label="foobar" role="widget"></p> `;
		const report = await htmlvalidate.validateString(markup);
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
			${'<dialog aria-label="foobar"></dialog>'}     | ${"<dialog>"}
			${'<form aria-label="foobar"></form>'}         | ${"<form>"}
			${'<fieldset aria-label="foobar"></fieldset>'} | ${"<fieldset>"}
			${'<iframe aria-label="foobar"></iframe>'}     | ${"<iframe>"}
			${'<img aria-label="foobar">'}                 | ${"<img>"}
			${'<figure aria-label="foobar"></figure>'}     | ${"<figure>"}
			${'<summary aria-label="foobar"></summary>'}   | ${"<summary>"}
			${'<table aria-label="foobar"></table>'}       | ${"<table>"}
			${'<td aria-label="foobar"></td>'}             | ${"<td>"}
			${'<th aria-label="foobar"></th>'}             | ${"<th>"}
			${'<any aria-label="foobar"></any>'}           | ${"<any>"}
		`("$description", async ({ markup }: { markup: string }) => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	it("should not report on custom element with explicit aria-label attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <custom-allowed aria-label="foobar"></custom-allowed> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when aria-label is used on invalid element", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <p aria-label="foobar"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "aria-label" cannot be used on this element (aria-label-misuse) at inline:1:5:
			> 1 |  <p aria-label="foobar"></p>
			    |     ^^^^^^^^^^
			Selector: p"
		`);
	});

	it("should report error when aria-label is used on input hidden", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <input type="hidden" aria-label="foobar" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "aria-label" cannot be used on this element (aria-label-misuse) at inline:1:23:
			> 1 |  <input type="hidden" aria-label="foobar" />
			    |                       ^^^^^^^^^^
			Selector: input"
		`);
	});

	it("should report error on custom element with without explicit aria-label attribute", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <custom-disallowed aria-label="foobar"></custom-disallowed> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "aria-label" cannot be used on this element (aria-label-misuse) at inline:1:21:
			> 1 |  <custom-disallowed aria-label="foobar"></custom-disallowed>
			    |                     ^^^^^^^^^^
			Selector: custom-disallowed"
		`);
	});

	it("should handle dynamic attribute", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <p dynamic-aria-label="foobar"></p> `;
		const report = await htmlvalidate.validateString(markup, { processAttribute });
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "aria-label" cannot be used on this element (aria-label-misuse) at inline:1:5:
			> 1 |  <p dynamic-aria-label="foobar"></p>
			    |     ^^^^^^^^^^^^^^^^^^
			Selector: p"
		`);
	});

	it("should handle interpolated attribute", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <p aria-label="{{ interpolated }}"></p> `;
		const report = await htmlvalidate.validateString(markup, { processAttribute });
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "aria-label" cannot be used on this element (aria-label-misuse) at inline:1:5:
			> 1 |  <p aria-label="{{ interpolated }}"></p>
			    |     ^^^^^^^^^^
			Selector: p"
		`);
	});

	describe("with allowAnyNamable option", () => {
		it("should not report error for elements which allow naming", async () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				elements: ["html5"],
				rules: { "aria-label-misuse": ["error", { allowAnyNamable: true }] },
			});
			const markup = /* HTML */ ` <h1 aria-label="lorem ipsum">spam</h1> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error for elements where naming is prohibited", async () => {
			expect.assertions(2);
			const htmlvalidate = new HtmlValidate({
				elements: ["html5"],
				rules: { "aria-label-misuse": ["error", { allowAnyNamable: true }] },
			});
			const markup = /* HTML */ ` <span aria-label="lorem ipsum">spam</span> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: "aria-label" cannot be used on this element (aria-label-misuse) at inline:1:8:
				> 1 |  <span aria-label="lorem ipsum">spam</span>
				    |        ^^^^^^^^^^
				Selector: span"
			`);
		});
	});

	describe("without allowAnyNamable option", () => {
		it("should report error for elements where naming allowed is not recommended", async () => {
			expect.assertions(2);
			const htmlvalidate = new HtmlValidate({
				elements: ["html5"],
				rules: { "aria-label-misuse": ["error", { allowAnyNamable: false }] },
			});
			const markup = /* HTML */ ` <h1 aria-label="lorem ipsum">spam</h1> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: "aria-label" cannot be used on this element (aria-label-misuse) at inline:1:6:
				> 1 |  <h1 aria-label="lorem ipsum">spam</h1>
				    |      ^^^^^^^^^^
				Selector: h1"
			`);
		});
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("aria-label-misuse");
		expect(docs).toMatchSnapshot();
	});
});
