import { HtmlValidate } from "../htmlvalidate";
import { defineMetadata } from "../meta";
import "../jest";

describe("rule element-permitted-order", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "element-permitted-order": "error" },
		});
	});

	it("should report error when child is used in wrong order", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<table>
				<thead></thead>
				<caption></caption>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
		"error: Element <caption> must be used before <thead> in this context (element-permitted-order) at inline:4:6:
		  2 | 			<table>
		  3 | 				<thead></thead>
		> 4 | 				<caption></caption>
		    | 				 ^^^^^^^
		  5 | 			</table>
		  6 |
		Selector: table > caption"
	`);
	});

	it("should not report error when child is used in right order", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<caption></caption>
				<thead></thead>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when disallowed child is used", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<foo></foo>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when child with unspecified order is used", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<table>
				<caption></caption>
				<template></template>
				<thead></thead>
			</table>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle selector list as equal order", async () => {
		expect.assertions(3);
		const htmlvalidate = new HtmlValidate({
			root: true,
			elements: [
				defineMetadata({
					element: {
						permittedContent: ["foo", "bar", "baz"],

						/* both <bar> and <baz> should be allowed in any order after <foo> */
						permittedOrder: ["foo", "bar, baz"],
					},
				}),
			],
			rules: { "element-permitted-order": "error" },
		});

		const valid = /* HTML */ `
			<element>
				<foo></foo>
				<bar></bar>
				<baz></baz>
			</element>

			<element>
				<foo></foo>
				<baz></baz>
				<bar></bar>
			</element>
		`;

		const invalid = /* HTML */ `
			<element>
				<bar></bar>
				<baz></baz>
				<foo></foo>
			</element>

			<element>
				<baz></baz>
				<bar></bar>
				<foo></foo>
			</element>

			<element>
				<bar></bar>
				<foo></foo>
				<baz></baz>
			</element>
		`;

		const report1 = await htmlvalidate.validateString(valid);
		const report2 = await htmlvalidate.validateString(invalid);

		expect(report1).toBeValid();
		expect(report2).toBeInvalid();
		expect(report2).toMatchInlineCodeframe(`
			"error: Element <foo> must be used before <baz> in this context (element-permitted-order) at inline:5:6:
			  3 | 				<bar></bar>
			  4 | 				<baz></baz>
			> 5 | 				<foo></foo>
			    | 				 ^^^
			  6 | 			</element>
			  7 |
			  8 | 			<element>
			Selector: element:nth-child(1) > foo
			error: Element <foo> must be used before <bar> in this context (element-permitted-order) at inline:11:6:
			   9 | 				<baz></baz>
			  10 | 				<bar></bar>
			> 11 | 				<foo></foo>
			     | 				 ^^^
			  12 | 			</element>
			  13 |
			  14 | 			<element>
			Selector: element:nth-child(2) > foo
			error: Element <foo> must be used before <bar> in this context (element-permitted-order) at inline:16:6:
			  14 | 			<element>
			  15 | 				<bar></bar>
			> 16 | 				<foo></foo>
			     | 				 ^^^
			  17 | 				<baz></baz>
			  18 | 			</element>
			  19 |
			Selector: element:nth-child(3) > foo"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("element-permitted-order");
		expect(docs).toMatchSnapshot();
	});
});
