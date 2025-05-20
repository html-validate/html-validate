import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import {
	type ContentContext,
	type DescendantContext,
	ErrorKind,
} from "./element-permitted-content";

describe("rule element-permitted-content", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "element-permitted-content": "error" },
		});
	});

	it("should not report error when elements are used correctly", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<p><span>foo</span></p>
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when @flow is child of @phrasing", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <span><div></div></span> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <div> element is not permitted as content under <span> (element-permitted-content) at inline:1:9:
			> 1 |  <span><div></div></span>
			    |         ^^^
			Selector: span > div"
		`);
	});

	it("should report error when child is disallowed (referenced by tagname without meta)", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			elements: [
				"html5",
				{
					"custom-link": {
						permittedContent: [{ exclude: "custom-element" }],
					},
				},
			],
			rules: { "element-permitted-content": "error" },
		});
		const markup = /* HTML */ ` <custom-link><custom-element></custom-element></custom-link> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <custom-element> element is not permitted as content under <custom-link> (element-permitted-content) at inline:1:16:
			> 1 |  <custom-link><custom-element></custom-element></custom-link>
			    |                ^^^^^^^^^^^^^^
			Selector: custom-link > custom-element"
		`);
	});

	it("should report error when descendant is disallowed", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<a>
				<span><button></button></span>
			</a>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <button> element is not permitted as a descendant of <a> (element-permitted-content) at inline:3:12:
			  1 |
			  2 | 			<a>
			> 3 | 				<span><button></button></span>
			    | 				       ^^^^^^
			  4 | 			</a>
			  5 |
			Selector: a > span > button"
		`);
	});

	it("should report error when descendant is disallowed (referenced by tagname without meta)", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			elements: [
				"html5",
				{
					"custom-link": {
						permittedDescendants: [{ exclude: "custom-element" }],
					},
				},
			],
			rules: { "element-permitted-content": "error" },
		});
		const markup = /* HTML */ `
			<custom-link>
				<span><custom-element></custom-element></span>
			</custom-link>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <custom-element> element is not permitted as a descendant of <custom-link> (element-permitted-content) at inline:3:12:
			  1 |
			  2 | 			<custom-link>
			> 3 | 				<span><custom-element></custom-element></span>
			    | 				       ^^^^^^^^^^^^^^
			  4 | 			</custom-link>
			  5 |
			Selector: custom-link > span > custom-element"
		`);
	});

	it("should report error when descendant is disallowed (intermediate element without meta)", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<a>
				<custom-element><button></button></custom-element>
			</a>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <button> element is not permitted as a descendant of <a> (element-permitted-content) at inline:3:22:
			  1 |
			  2 | 			<a>
			> 3 | 				<custom-element><button></button></custom-element>
			    | 				                 ^^^^^^
			  4 | 			</a>
			  5 |
			Selector: a > custom-element > button"
		`);
	});

	describe("transparent", () => {
		it("should not report error when phrasing a-element is child of @phrasing", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<span>
					<a>
						<span></span>
					</a>
				</span>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when non-phrasing a-element is child of @phrasing", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<span>
					<a>
						<div></div>
					</a>
				</span>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <div> element is not permitted as content under <span> (element-permitted-content) at inline:4:8:
				  2 | 				<span>
				  3 | 					<a>
				> 4 | 						<div></div>
				    | 						 ^^^
				  5 | 					</a>
				  6 | 				</span>
				  7 |
				Selector: span > a > div"
			`);
		});

		it("should report error for children listed as transparent", async () => {
			expect.assertions(2);
			const htmlvalidate = new HtmlValidate({
				elements: [
					"html5",
					{
						"transparent-element": {
							phrasing: true,
							transparent: ["div"],
						},
					},
				],
				rules: { "element-permitted-content": "error" },
			});
			const markup = /* HTML */ `
				<span>
					<transparent-element>
						<div></div>
					</transparent-element>
				</span>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <div> element is not permitted as content under <span> (element-permitted-content) at inline:4:8:
				  2 | 				<span>
				  3 | 					<transparent-element>
				> 4 | 						<div></div>
				    | 						 ^^^
				  5 | 					</transparent-element>
				  6 | 				</span>
				  7 |
				Selector: span > transparent-element > div"
			`);
		});

		it("should not report error for children not listed as transparent", async () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				elements: [
					"html5",
					{
						"transparent-element": {
							phrasing: true,
							transparent: ["p"],
						},
					},
				],
				rules: { "element-permitted-content": "error" },
			});
			const markup = /* HTML */ `
				<span>
					<transparent-element>
						<div></div>
					</transparent-element>
				</span>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error for transparent unknown element children", async () => {
			expect.assertions(1);
			const htmlvalidate = new HtmlValidate({
				elements: [
					"html5",
					{
						"transparent-element": {
							phrasing: true,
							transparent: ["@flow"],
						},
					},
				],
				rules: { "element-permitted-content": "error" },
			});
			const markup = /* HTML */ `
				<span>
					<transparent-element>
						<unknown-element></unknown-element>
					</transparent-element>
				</span>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	it("should report error when label contains non-phrasing", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<label>
				<div>foobar</div>
			</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <div> element is not permitted as content under <label> (element-permitted-content) at inline:3:6:
			  1 |
			  2 | 			<label>
			> 3 | 				<div>foobar</div>
			    | 				 ^^^
			  4 | 			</label>
			  5 |
			Selector: label > div"
		`);
	});

	it("should handle missing meta entry (child)", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p><foo>foo</foo></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle missing meta entry (parent)", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <foo><p>foo</p></foo> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	describe("<template>", () => {
		it("should not report error when a non permitted descendant is inside a template tag child", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<a href="">
					<template>
						<a href="">Other content</a>
					</template>
				</a>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error when a non permitted descendant is inside a template tag descendant", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<a href="">
					Some content
					<span>
						<template>
							<a href="">Other content</a>
						</template>
					</span>
				</a>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report an error for non permitted descendants within a template tag", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<template>
					<a href="">
						Some content
						<span>
							<a href="">Other content</a>
						</span>
					</a>
				</template>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <a> element is not permitted as a descendant of <a> (element-permitted-content) at inline:6:9:
				  4 | 						Some content
				  5 | 						<span>
				> 6 | 							<a href="">Other content</a>
				    | 							 ^
				  7 | 						</span>
				  8 | 					</a>
				  9 | 				</template>
				Selector: template > a > span > a"
			`);
		});
	});

	describe("should contain documentation", () => {
		it("content error", async () => {
			expect.assertions(1);
			const context: ContentContext = {
				kind: ErrorKind.CONTENT,
				child: "<div>",
				parent: "<span>",
			};
			const doc = await htmlvalidate.getRuleDocumentation(
				"element-permitted-content",
				null,
				context,
			);
			expect(doc).toMatchSnapshot();
		});

		it("descendant error", async () => {
			expect.assertions(1);
			const context: DescendantContext = {
				kind: ErrorKind.DESCENDANT,
				child: "<div>",
				ancestor: "<span>",
			};
			const doc = await htmlvalidate.getRuleDocumentation(
				"element-permitted-content",
				null,
				context,
			);
			expect(doc).toMatchSnapshot();
		});
	});
});
