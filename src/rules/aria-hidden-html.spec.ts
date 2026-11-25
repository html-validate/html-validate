import { beforeAll, describe, expect, it } from "@jest/globals";
import { HtmlValidate } from "../htmlvalidate";
import "html-validate/jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule aria-hidden-html", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "aria-hidden-html": "error" },
		});
	});

	it("should not report error for other elements", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div aria-hidden="true"></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when html is missing aria-hidden attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <html></html> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when html is missing aria-hidden value", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <html aria-hidden></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when html has invalid aria-hidden value", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <html aria-hidden="foobar"></html> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should not report error when html has aria-hidden="false"', async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <html aria-hidden="false"></html> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should report error when html has aria-hidden="true"', async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <html aria-hidden="true"></html> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: aria-hidden must not be used on <html> (aria-hidden-html)
			> 1 |  <html aria-hidden="true"></html>
			    |        ^^^^^^^^^^^
			Selector: html"
		`);
	});

	it("should autofix by removing aria-hidden attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <html lang="en" aria-hidden="true"></html> `;
		const report = await htmlvalidate.validateString(markup);
		const [message] = report.results[0].messages;
		const result = await htmlvalidate.autofix(message.fix!);
		expect(result).toBe(` <html lang="en" ></html> `);
	});

	it("should report error when html has dynamic aria-hidden value", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <html dynamic-aria-hidden="foo"></html> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: aria-hidden must not be used on <html> (aria-hidden-html)
			> 1 |  <html dynamic-aria-hidden="foo"></html>
			    |        ^^^^^^^^^^^^^^^^^^^
			Selector: html"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getContextualDocumentation({ ruleId: "aria-hidden-html" });
		expect(docs?.description).toMatchInlineSnapshot(
			`"\`aria-hidden\` must not be used on the \`<html>\` element as it makes the page inaccessible to assistive technology such as screenreaders"`,
		);
	});
});
