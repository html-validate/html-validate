import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule script-type", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "script-type": "error" },
		});
	});

	it("should not report when script element has implied type", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <script></script> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when script element has module type", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <script type="module"></script> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when script element has non-js type", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <script type="text/plain"></script> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for dynamic attributes", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <script dynamic-type="type"></script> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should not report for other elements", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p type="module"></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report when script element have empty type", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <script type=""></script> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: "type" attribute is unnecessary for javascript resources (script-type) at inline:1:10:
			> 1 |  <script type=""></script>
			    |          ^^^^
			Selector: script"
		`);
	});

	it("should report when script element have javascript type", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <script type="text/javascript"></script> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: "type" attribute is unnecessary for javascript resources (script-type) at inline:1:10:
			> 1 |  <script type="text/javascript"></script>
			    |          ^^^^
			Selector: script"
		`);
	});

	it("should report when script element have javascript type with parameter", async () => {
		expect.assertions(1);
		const markup = '<script type="text/javascript;charset=utf-8"></script>';
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: "type" attribute is unnecessary for javascript resources (script-type) at inline:1:9:
			> 1 | <script type="text/javascript;charset=utf-8"></script>
			    |         ^^^^
			Selector: script"
		`);
	});

	it("should report when script element have legacy javascript type", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <script type="text/javascript"></script> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toMatchInlineCodeframe(`
			"error: "type" attribute is unnecessary for javascript resources (script-type) at inline:1:10:
			> 1 |  <script type="text/javascript"></script>
			    |          ^^^^
			Selector: script"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("script-type");
		expect(docs).toMatchSnapshot();
	});
});
