import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";
import { type RuleContext } from "./aria-label-misuse";

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
							"aria-labelledby": {},
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

	it("should not report for element without aria-label or aria-labelledby", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for element with empty aria-label or aria-labelledby", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<p aria-label=""></p>
			<p aria-labelledby=""></p>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for element with boolean aria-label or aria-labelledby", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<p aria-label></p>
			<p aria-labelledby></p>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for element without meta", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<custom-element aria-label="foobar"></custom-element>
			<custom-element aria-labelledby="foobar"></custom-element>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for element with role", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<p aria-label="foobar" role="widget"></p>
			<p aria-labelledby="foobar" role="widget"></p>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	describe("should not report error for", () => {
		it.each`
			markup                                              | description
			${'<button aria-label="foobar"></button>'}          | ${"Interactive elements (aria-label)"}
			${'<button aria-labelledby="foobar"></button>'}     | ${"Interactive elements (aria-labelledby)"}
			${'<input type="text" aria-label="foobar">'}        | ${"Labelable elements (aria-label)"}
			${'<input type="text" aria-labelledby="foobar">'}   | ${"Labelable elements (aria-labelledby)"}
			${'<main aria-label="foobar"></main>'}              | ${"Landmark elements (aria-label)"}
			${'<main aria-labelledby="foobar"></main>'}         | ${"Landmark elements (aria-labelledby)"}
			${'<p role="widget" aria-label="foobar">'}          | ${'[role=".."] (aria-label)'}
			${'<p role="widget" aria-labelledby="foobar">'}     | ${'[role=".."] (aria-labelledby)'}
			${'<p tabindex="0" aria-label="foobar"></p>'}       | ${"[tabindex] (aria-label)"}
			${'<p tabindex="0" aria-labelledby="foobar"></p>'}  | ${"[tabindex] (aria-labelledby)"}
			${'<area aria-label="foobar"></area>'}              | ${"<area> (aria-label)"}
			${'<area aria-labelledby="foobar"></area>'}         | ${"<area> (aria-labelledby)"}
			${'<dialog aria-label="foobar"></dialog>'}          | ${"<dialog> (aria-label)"}
			${'<dialog aria-labelledby="foobar"></dialog>'}     | ${"<dialog> (aria-labelledby)"}
			${'<form aria-label="foobar"></form>'}              | ${"<form> (aria-label)"}
			${'<form aria-labelledby="foobar"></form>'}         | ${"<form> (aria-labelledby)"}
			${'<fieldset aria-label="foobar"></fieldset>'}      | ${"<fieldset> (aria-label)"}
			${'<fieldset aria-labelledby="foobar"></fieldset>'} | ${"<fieldset> (aria-labelledby)"}
			${'<iframe aria-label="foobar"></iframe>'}          | ${"<iframe> (aria-label)"}
			${'<iframe aria-labelledby="foobar"></iframe>'}     | ${"<iframe> (aria-labelledby)"}
			${'<img aria-label="foobar">'}                      | ${"<img> (aria-label)"}
			${'<img aria-labelledby="foobar">'}                 | ${"<img> (aria-labelledby)"}
			${'<figure aria-label="foobar"></figure>'}          | ${"<figure> (aria-label)"}
			${'<figure aria-labelledby="foobar"></figure>'}     | ${"<figure> (aria-labelledby)"}
			${'<summary aria-label="foobar"></summary>'}        | ${"<summary> (aria-label)"}
			${'<summary aria-labelledby="foobar"></summary>'}   | ${"<summary> (aria-labelledby)"}
			${'<table aria-label="foobar"></table>'}            | ${"<table> (aria-label)"}
			${'<table aria-labelledby="foobar"></table>'}       | ${"<table> (aria-labelledby)"}
			${'<td aria-label="foobar"></td>'}                  | ${"<td> (aria-label)"}
			${'<td aria-labelledby="foobar"></td>'}             | ${"<td> (aria-labelledby)"}
			${'<th aria-label="foobar"></th>'}                  | ${"<th> (aria-label)"}
			${'<th aria-labelledby="foobar"></th>'}             | ${"<th> (aria-labelledby)"}
			${'<any aria-label="foobar"></any>'}                | ${"<any> (aria-label)"}
			${'<any aria-labelledby="foobar"></any>'}           | ${"<any> (aria-labelledby)"}
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

	it("should report error when aria-label or aria-labelledby is used on invalid element", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<p aria-label="foobar"></p>
			<p aria-labelledby="foobar"></p>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "aria-label" cannot be used on this element (aria-label-misuse) at inline:2:7:
			  1 |
			> 2 | 			<p aria-label="foobar"></p>
			    | 			   ^^^^^^^^^^
			  3 | 			<p aria-labelledby="foobar"></p>
			  4 |
			Selector: p:nth-child(1)
			error: "aria-labelledby" cannot be used on this element (aria-label-misuse) at inline:3:7:
			  1 |
			  2 | 			<p aria-label="foobar"></p>
			> 3 | 			<p aria-labelledby="foobar"></p>
			    | 			   ^^^^^^^^^^^^^^^
			  4 |
			Selector: p:nth-child(2)"
		`);
	});

	it("should report error when aria-label or aria-labelledby is used on input hidden", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<input type="hidden" aria-label="foobar" />
			<input type="hidden" aria-labelledby="foobar" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "aria-label" cannot be used on this element (aria-label-misuse) at inline:2:25:
			  1 |
			> 2 | 			<input type="hidden" aria-label="foobar" />
			    | 			                     ^^^^^^^^^^
			  3 | 			<input type="hidden" aria-labelledby="foobar" />
			  4 |
			Selector: input:nth-child(1)
			error: "aria-labelledby" cannot be used on this element (aria-label-misuse) at inline:3:25:
			  1 |
			  2 | 			<input type="hidden" aria-label="foobar" />
			> 3 | 			<input type="hidden" aria-labelledby="foobar" />
			    | 			                     ^^^^^^^^^^^^^^^
			  4 |
			Selector: input:nth-child(2)"
		`);
	});

	it("should report error on custom element without explicit aria-label or aria-labelledby attribute", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<custom-disallowed aria-label="foobar"></custom-disallowed>
			<custom-disallowed aria-labelledby="foobar"></custom-disallowed>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "aria-label" cannot be used on this element (aria-label-misuse) at inline:2:23:
			  1 |
			> 2 | 			<custom-disallowed aria-label="foobar"></custom-disallowed>
			    | 			                   ^^^^^^^^^^
			  3 | 			<custom-disallowed aria-labelledby="foobar"></custom-disallowed>
			  4 |
			Selector: custom-disallowed:nth-child(1)
			error: "aria-labelledby" cannot be used on this element (aria-label-misuse) at inline:3:23:
			  1 |
			  2 | 			<custom-disallowed aria-label="foobar"></custom-disallowed>
			> 3 | 			<custom-disallowed aria-labelledby="foobar"></custom-disallowed>
			    | 			                   ^^^^^^^^^^^^^^^
			  4 |
			Selector: custom-disallowed:nth-child(2)"
		`);
	});

	it("should handle dynamic attribute", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<p dynamic-aria-label="foobar"></p>
			<p dynamic-aria-labelledby="foobar"></p>
		`;
		const report = await htmlvalidate.validateString(markup, { processAttribute });
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "aria-label" cannot be used on this element (aria-label-misuse) at inline:2:7:
			  1 |
			> 2 | 			<p dynamic-aria-label="foobar"></p>
			    | 			   ^^^^^^^^^^^^^^^^^^
			  3 | 			<p dynamic-aria-labelledby="foobar"></p>
			  4 |
			Selector: p:nth-child(1)
			error: "aria-labelledby" cannot be used on this element (aria-label-misuse) at inline:3:7:
			  1 |
			  2 | 			<p dynamic-aria-label="foobar"></p>
			> 3 | 			<p dynamic-aria-labelledby="foobar"></p>
			    | 			   ^^^^^^^^^^^^^^^^^^^^^^^
			  4 |
			Selector: p:nth-child(2)"
		`);
	});

	it("should handle interpolated attribute", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<p aria-label="{{ interpolated }}"></p>
			<p aria-labelledby="{{ interpolated }}"></p>
		`;
		const report = await htmlvalidate.validateString(markup, { processAttribute });
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "aria-label" cannot be used on this element (aria-label-misuse) at inline:2:7:
			  1 |
			> 2 | 			<p aria-label="{{ interpolated }}"></p>
			    | 			   ^^^^^^^^^^
			  3 | 			<p aria-labelledby="{{ interpolated }}"></p>
			  4 |
			Selector: p:nth-child(1)
			error: "aria-labelledby" cannot be used on this element (aria-label-misuse) at inline:3:7:
			  1 |
			  2 | 			<p aria-label="{{ interpolated }}"></p>
			> 3 | 			<p aria-labelledby="{{ interpolated }}"></p>
			    | 			   ^^^^^^^^^^^^^^^
			  4 |
			Selector: p:nth-child(2)"
		`);
	});

	describe("with allowAnyNamable option", () => {
		it("should not report error for elements which allow naming", async () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				elements: ["html5"],
				rules: { "aria-label-misuse": ["error", { allowAnyNamable: true }] },
			});
			const markup = /* HTML */ `
				<h1 aria-label="lorem ipsum">spam</h1>
				<h1 aria-labelledby="lorem ipsum">spam</h1>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error for elements where naming is prohibited", async () => {
			expect.assertions(2);
			const htmlvalidate = new HtmlValidate({
				elements: ["html5"],
				rules: { "aria-label-misuse": ["error", { allowAnyNamable: true }] },
			});
			const markup = /* HTML */ `
				<span aria-label="lorem ipsum">spam</span>
				<span aria-labelledby="lorem ipsum">spam</span>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: "aria-label" cannot be used on this element (aria-label-misuse) at inline:2:11:
				  1 |
				> 2 | 				<span aria-label="lorem ipsum">spam</span>
				    | 				      ^^^^^^^^^^
				  3 | 				<span aria-labelledby="lorem ipsum">spam</span>
				  4 |
				Selector: span:nth-child(1)
				error: "aria-labelledby" cannot be used on this element (aria-label-misuse) at inline:3:11:
				  1 |
				  2 | 				<span aria-label="lorem ipsum">spam</span>
				> 3 | 				<span aria-labelledby="lorem ipsum">spam</span>
				    | 				      ^^^^^^^^^^^^^^^
				  4 |
				Selector: span:nth-child(2)"
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
			const markup = /* HTML */ `
				<h1 aria-label="lorem ipsum">spam</h1>
				<h1 aria-labelledby="lorem ipsum">spam</h1>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: "aria-label" cannot be used on this element (aria-label-misuse) at inline:2:9:
				  1 |
				> 2 | 				<h1 aria-label="lorem ipsum">spam</h1>
				    | 				    ^^^^^^^^^^
				  3 | 				<h1 aria-labelledby="lorem ipsum">spam</h1>
				  4 |
				Selector: h1:nth-child(1)
				error: "aria-labelledby" cannot be used on this element (aria-label-misuse) at inline:3:9:
				  1 |
				  2 | 				<h1 aria-label="lorem ipsum">spam</h1>
				> 3 | 				<h1 aria-labelledby="lorem ipsum">spam</h1>
				    | 				    ^^^^^^^^^^^^^^^
				  4 |
				Selector: h1:nth-child(2)"
			`);
		});
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const context: RuleContext = { attr: "aria-label" };
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "aria-label-misuse",
			context,
		});
		expect(docs).toMatchSnapshot();
	});
});
