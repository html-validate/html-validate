import HtmlValidate from "../htmlvalidate";
import "../jest";
import {
	type AncestorContext,
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

	it("should not report error when elements are used correctly", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<p><span>foo</span></p>
			</div>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when @flow is child of @phrasing", () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <span><div></div></span> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <div> element is not permitted as content under <span> (element-permitted-content) at inline:1:9:
			> 1 |  <span><div></div></span>
			    |         ^^^
			Selector: span > div"
		`);
	});

	it("should report error when child is disallowed (referenced by tagname without meta)", () => {
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
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <custom-element> element is not permitted as content under <custom-link> (element-permitted-content) at inline:1:16:
			> 1 |  <custom-link><custom-element></custom-element></custom-link>
			    |                ^^^^^^^^^^^^^^
			Selector: custom-link > custom-element"
		`);
	});

	it("should report error when descendant is disallowed", () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<a>
				<span><button></button></span>
			</a>
		`;
		const report = htmlvalidate.validateString(markup);
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

	it("should report error when descendant is disallowed (referenced by tagname without meta)", () => {
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
		const report = htmlvalidate.validateString(markup);
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

	it("should report error when descendant is disallowed (intermediate element without meta)", () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<a>
				<custom-element><button></button></custom-element>
			</a>
		`;
		const report = htmlvalidate.validateString(markup);
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
		it("should not report error when phrasing a-element is child of @phrasing", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<span>
					<a>
						<span></span>
					</a>
				</span>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should report error when non-phrasing a-element is child of @phrasing", () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<span>
					<a>
						<div></div>
					</a>
				</span>
			`;
			const report = htmlvalidate.validateString(markup);
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

		it("should report error for children listed as transparent", () => {
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
			const report = htmlvalidate.validateString(markup);
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

		it("should not report error for children not listed as transparent", () => {
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
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("should not report error for transparent unknown element children", () => {
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
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	it("should report error when label contains non-phrasing", () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<label>
				<div>foobar</div>
			</label>
		`;
		const report = htmlvalidate.validateString(markup);
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

	describe("requiredAncestor", () => {
		it("should report error for missing required ancestor (tagname)", () => {
			expect.assertions(2);
			const htmlvalidate = new HtmlValidate({
				root: true,
				elements: [
					"html5",
					{
						"custom-element": {
							flow: true,
							requiredAncestors: ["main"],
						},
					},
				],
				rules: { "element-permitted-content": "error" },
			});
			const markup = /* HTML */ `
				<div>
					<custom-element></custom-element>
				</div>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <custom-element> element requires a <main> ancestor (element-permitted-content) at inline:3:7:
				  1 |
				  2 | 				<div>
				> 3 | 					<custom-element></custom-element>
				    | 					 ^^^^^^^^^^^^^^
				  4 | 				</div>
				  5 |
				Selector: div > custom-element"
			`);
		});

		it("should report error for missing required ancestor (selector)", () => {
			expect.assertions(2);
			const htmlvalidate = new HtmlValidate({
				root: true,
				elements: [
					"html5",
					{
						"custom-element": {
							flow: true,
							requiredAncestors: ["main > div"],
						},
					},
				],
				rules: { "element-permitted-content": "error" },
			});
			const markup = /* HTML */ `
				<div>
					<custom-element></custom-element>
				</div>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <custom-element> element requires a "main > div" ancestor (element-permitted-content) at inline:3:7:
				  1 |
				  2 | 				<div>
				> 3 | 					<custom-element></custom-element>
				    | 					 ^^^^^^^^^^^^^^
				  4 | 				</div>
				  5 |
				Selector: div > custom-element"
			`);
		});

		it("should join multiple selectors together", () => {
			expect.assertions(2);
			const htmlvalidate = new HtmlValidate({
				root: true,
				elements: [
					"html5",
					{
						"custom-element": {
							flow: true,
							requiredAncestors: ["main", "main > div"],
						},
					},
				],
				rules: { "element-permitted-content": "error" },
			});
			const markup = /* HTML */ `
				<div>
					<custom-element></custom-element>
				</div>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: <custom-element> element requires a <main> or "main > div" ancestor (element-permitted-content) at inline:3:7:
				  1 |
				  2 | 				<div>
				> 3 | 					<custom-element></custom-element>
				    | 					 ^^^^^^^^^^^^^^
				  4 | 				</div>
				  5 |
				Selector: div > custom-element"
			`);
		});

		it("should not report error for proper required ancestor", () => {
			expect.assertions(1);
			const markup = /* HTML */ `
				<dl>
					<div><dt>foo</dt></div>
				</dl>
			`;
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	it("should handle missing meta entry (child)", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <p><foo>foo</foo></p> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle missing meta entry (parent)", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <foo><p>foo</p></foo> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("element-permitted-content")).toMatchSnapshot();
	});

	describe("should contain contextual documentation", () => {
		it("content error", () => {
			expect.assertions(1);
			const context: ContentContext = {
				kind: ErrorKind.CONTENT,
				child: "<div>",
				parent: "<span>",
			};
			const doc = htmlvalidate.getRuleDocumentation("element-permitted-content", null, context);
			expect(doc).toMatchSnapshot();
		});

		it("descendant error", () => {
			expect.assertions(1);
			const context: DescendantContext = {
				kind: ErrorKind.DESCENDANT,
				child: "<div>",
				ancestor: "<span>",
			};
			const doc = htmlvalidate.getRuleDocumentation("element-permitted-content", null, context);
			expect(doc).toMatchSnapshot();
		});

		it("ancestor error", () => {
			expect.assertions(1);
			const context: AncestorContext = {
				kind: ErrorKind.ANCESTOR,
				child: "<li>",
				ancestor: ["<ul>", "<ol>", "<menu>"],
			};
			const doc = htmlvalidate.getRuleDocumentation("element-permitted-content", null, context);
			expect(doc).toMatchSnapshot();
		});
	});
});
