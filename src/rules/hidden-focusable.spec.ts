import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule hidden-focusable", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "hidden-focusable": "error" },
		});
	});

	it("should not report error when non-interactive elements are hidden", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div aria-hidden="true"></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when interactive elements is not hidden", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<a href="#"></a>
			<a href="#" aria-hidden="false"></a>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when hidden element is also hidden from DOM", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<!-- element itself is hidden -->
			<a href="#" hidden aria-hidden="true"></a>

			<!-- parent is hidden -->
			<div hidden>
				<a href="#" aria-hidden="true"></a>
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when hidden element is inert", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<!-- element itself is inert -->
			<a href="#" hidden aria-hidden="true"></a>

			<!-- parent is inert -->
			<div inert>
				<a href="#" aria-hidden="true"></a>
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error on unknown elements without tabindex", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <any aria-hidden="true"></any> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when tabindex is negative", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<input tabindex="-1" aria-hidden="true" />
			<div aria-hidden="true">
				<input tabindex="-1" />
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when interactive element is hidden", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <a href="#" aria-hidden="true"></a> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: aria-hidden cannot be used on focusable elements (hidden-focusable) at inline:1:14:
			> 1 |  <a href="#" aria-hidden="true"></a>
			    |              ^^^^^^^^^^^
			Selector: a"
		`);
	});

	it("should report error when element with tabindex is hidden", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <p tabindex="0" aria-hidden="true"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: aria-hidden cannot be used on focusable elements (hidden-focusable) at inline:1:18:
			> 1 |  <p tabindex="0" aria-hidden="true"></p>
			    |                  ^^^^^^^^^^^
			Selector: p"
		`);
	});

	it("should report error when interactive element is hidden by parent", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <div aria-hidden="true"><a href="#"></a></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: aria-hidden cannot be used on focusable elements (hidden by ancestor element) (hidden-focusable) at inline:1:27:
			> 1 |  <div aria-hidden="true"><a href="#"></a></div>
			    |                           ^
			Selector: div > a"
		`);
	});

	it("should report error when element with tabindex is hidden by parent", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <div aria-hidden="true"><p tabindex="0"></p></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: aria-hidden cannot be used on focusable elements (hidden by ancestor element) (hidden-focusable) at inline:1:27:
			> 1 |  <div aria-hidden="true"><p tabindex="0"></p></div>
			    |                           ^
			Selector: div > p"
		`);
	});

	it("should report error on unknown elements with tabindex", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <any tabindex="0" aria-hidden="true"></any> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: aria-hidden cannot be used on focusable elements (hidden-focusable) at inline:1:20:
			> 1 |  <any tabindex="0" aria-hidden="true"></any>
			    |                    ^^^^^^^^^^^
			Selector: any"
		`);
	});

	it("should handle interactive expressions", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<!-- should not yield error: not interactive -->
			<video aria-hidden="true"></video>

			<!-- should yield error: interactive -->
			<video controls aria-hidden="true"></video>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: aria-hidden cannot be used on focusable elements (hidden-focusable) at inline:6:20:
			  4 |
			  5 | 			<!-- should yield error: interactive -->
			> 6 | 			<video controls aria-hidden="true"></video>
			    | 			                ^^^^^^^^^^^
			  7 |
			Selector: video:nth-child(2)"
		`);
	});

	it("should contain documentation (self)", async () => {
		expect.assertions(2);
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "hidden-focusable",
			context: "self",
		});
		expect(docs?.description).toMatchInlineSnapshot(`
			"\`aria-hidden\` cannot be used on focusable elements.

			When focusable elements are hidden with \`aria-hidden\` they are still reachable using conventional means such as a mouse or keyboard but won't be exposed to assistive technology (AT).
			This is often confusing for users of AT such as screenreaders.

			To fix this either:
			  - Remove \`aria-hidden\`.
			  - Remove the element from the DOM instead.
			  - Use \`tabindex="-1"\` to remove the element from tab order.
			  - Use \`hidden\`, \`inert\` or similar means to hide or disable the element."
		`);
		expect(docs?.url).toMatchInlineSnapshot(
			`"https://html-validate.org/rules/hidden-focusable.html"`,
		);
	});

	it("should contain documentation (parent)", async () => {
		expect.assertions(2);
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "hidden-focusable",
			context: "parent",
		});
		expect(docs?.description).toMatchInlineSnapshot(`
			"\`aria-hidden\` cannot be used on focusable elements. In this case it is being hidden by an ancestor with \`aria-hidden.\`

			When focusable elements are hidden with \`aria-hidden\` they are still reachable using conventional means such as a mouse or keyboard but won't be exposed to assistive technology (AT).
			This is often confusing for users of AT such as screenreaders.

			To fix this either:
			  - Remove \`aria-hidden\`.
			  - Remove the element from the DOM instead.
			  - Use \`tabindex="-1"\` to remove the element from tab order.
			  - Use \`hidden\`, \`inert\` or similar means to hide or disable the element."
		`);
		expect(docs?.url).toMatchInlineSnapshot(
			`"https://html-validate.org/rules/hidden-focusable.html"`,
		);
	});
});
