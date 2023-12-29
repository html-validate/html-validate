import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-missing-references", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-missing-references": "error" },
		});
	});

	it('should not report error when <label for=".."> is referencing existing element', async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for="existing"></label>
			<input id="existing" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should not report error when <input list=".."> is referencing existing element', async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<input list="existing" />
			<datalist id="existing"></datalist>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should not report error when <ANY aria-labelledby=".."> is referencing existing element', async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div aria-labelledby="existing"></div>
			<span id="existing"></span>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should not report error when <ANY aria-describedby=".."> is referencing existing element', async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div aria-describedby="existing"></div>
			<span id="existing"></span>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should not report error when <ANY aria-controls=".."> is referencing existing element', async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div aria-controls="existing"></div>
			<span id="existing"></span>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when reference is omitted", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <label for></label> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when reference is empty string", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <label for=""></label> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when reference is <title> element in <svg>", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div aria-labelledby="existing"></div>
			<svg>
				<title id="existing">lorem ipsum</title>
			</svg>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when reference is <desc> element in <svg>", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div aria-labelledby="existing"></div>
			<svg>
				<desc id="existing">lorem ipsum</desc>
			</svg>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should report error when <label for=".."> is referencing missing element', async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <label for="missing"></label> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Element references missing id "missing" (no-missing-references) at inline:1:14:
			> 1 |  <label for="missing"></label>
			    |              ^^^^^^^
			Selector: label"
		`);
	});

	it('should report error when <input list=".."> is referencing missing element', async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <input list="missing" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Element references missing id "missing" (no-missing-references) at inline:1:15:
			> 1 |  <input list="missing" />
			    |               ^^^^^^^
			Selector: input"
		`);
	});

	it('should report error when <ANY aria-activedescendant=".."> is referencing missing element', async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <div aria-activedescendant="missing id"></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Element references missing id "missing id" (no-missing-references) at inline:1:30:
			> 1 |  <div aria-activedescendant="missing id"></div>
			    |                              ^^^^^^^^^^
			Selector: div"
		`);
	});

	it('should report error when <ANY aria-labelledby=".."> is referencing missing element', async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <div aria-labelledby="missing id"></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Element references missing id "missing" (no-missing-references) at inline:1:24:
			> 1 |  <div aria-labelledby="missing id"></div>
			    |                        ^^^^^^^
			Selector: div
			error: Element references missing id "id" (no-missing-references) at inline:1:32:
			> 1 |  <div aria-labelledby="missing id"></div>
			    |                                ^^
			Selector: div"
		`);
	});

	it('should report error when <ANY aria-describedby=".."> is referencing missing element', async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <div aria-describedby="missing id"></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Element references missing id "missing" (no-missing-references) at inline:1:25:
			> 1 |  <div aria-describedby="missing id"></div>
			    |                         ^^^^^^^
			Selector: div
			error: Element references missing id "id" (no-missing-references) at inline:1:33:
			> 1 |  <div aria-describedby="missing id"></div>
			    |                                 ^^
			Selector: div"
		`);
	});

	it('should report error when <ANY aria-controls=".."> is referencing missing element', async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <div aria-controls="missing id"></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Element references missing id "missing" (no-missing-references) at inline:1:22:
			> 1 |  <div aria-controls="missing id"></div>
			    |                      ^^^^^^^
			Selector: div
			error: Element references missing id "id" (no-missing-references) at inline:1:30:
			> 1 |  <div aria-controls="missing id"></div>
			    |                              ^^
			Selector: div"
		`);
	});

	it('should report error when <ANY aria-details=".."> is referencing missing element', async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <div aria-details="missing id"></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Element references missing id "missing id" (no-missing-references) at inline:1:21:
			> 1 |  <div aria-details="missing id"></div>
			    |                     ^^^^^^^^^^
			Selector: div"
		`);
	});

	it('should report error when <ANY aria-errormessage=".."> is referencing missing element', async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <div aria-errormessage="missing id"></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Element references missing id "missing id" (no-missing-references) at inline:1:26:
			> 1 |  <div aria-errormessage="missing id"></div>
			    |                          ^^^^^^^^^^
			Selector: div"
		`);
	});

	it('should report error when <ANY aria-flowto=".."> is referencing missing element', async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<div aria-flowto="foo bar baz"></div>
			<span id="bar"></span>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Element references missing id "foo" (no-missing-references) at inline:2:22:
			  1 |
			> 2 | 			<div aria-flowto="foo bar baz"></div>
			    | 			                  ^^^
			  3 | 			<span id="bar"></span>
			  4 |
			Selector: div
			error: Element references missing id "baz" (no-missing-references) at inline:2:30:
			  1 |
			> 2 | 			<div aria-flowto="foo bar baz"></div>
			    | 			                          ^^^
			  3 | 			<span id="bar"></span>
			  4 |
			Selector: div"
		`);
	});

	it('should report error when <ANY aria-owns=".."> is referencing missing element', async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<div aria-owns="foo bar baz"></div>
			<span id="bar"></span>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Element references missing id "foo" (no-missing-references) at inline:2:20:
			  1 |
			> 2 | 			<div aria-owns="foo bar baz"></div>
			    | 			                ^^^
			  3 | 			<span id="bar"></span>
			  4 |
			Selector: div
			error: Element references missing id "baz" (no-missing-references) at inline:2:28:
			  1 |
			> 2 | 			<div aria-owns="foo bar baz"></div>
			    | 			                        ^^^
			  3 | 			<span id="bar"></span>
			  4 |
			Selector: div"
		`);
	});

	it("should handle colon in id", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for=":r1:">lorem ipsum</label>
			<input id=":r1:" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "no-missing-references": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("no-missing-references", null, {
			key: "my-attribute",
			value: "my-id",
		});
		expect(docs).toMatchSnapshot();
	});
});
