import HtmlValidate from "../htmlvalidate";
import "../jest";

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
		const markup = "<div><p><span>foo</span></p></div>";
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when @flow is child of @phrasing", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<span><div></div></span>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"element-permitted-content",
			"Element <div> is not permitted as content in <span>"
		);
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
		const report = htmlvalidate.validateString(
			"<custom-link><custom-element></custom-element></custom-link>"
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"element-permitted-content",
			"Element <custom-element> is not permitted as content in <custom-link>"
		);
	});

	it("should report error when descendant is disallowed", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<a><span><button></button></span></a>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"element-permitted-content",
			"Element <button> is not permitted as descendant of <a>"
		);
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
		const report = htmlvalidate.validateString(
			"<custom-link><span><custom-element></custom-element></span></custom-link>"
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"element-permitted-content",
			"Element <custom-element> is not permitted as descendant of <custom-link>"
		);
	});

	it("should report error when descendant is disallowed (intermediate element without meta)", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString(
			"<a><custom-element><button></button></custom-element></a>"
		);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"element-permitted-content",
			"Element <button> is not permitted as descendant of <a>"
		);
	});

	describe("transparent", () => {
		it("should not report error when phrasing a-element is child of @phrasing", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString("<span><a><span></span></a></span>");
			expect(report).toBeValid();
		});

		it("should report error when non-phrasing a-element is child of @phrasing", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<span><a><div></div></a></span>");
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"element-permitted-content",
				"Element <div> is not permitted as content in <span>"
			);
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
			const markup = "<span><transparent-element><div></div></transparent-element></span>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"element-permitted-content",
				"Element <div> is not permitted as content in <span>"
			);
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
			const markup = "<span><transparent-element><div></div></transparent-element></span>";
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
			const markup =
				"<span><transparent-element><unknown-element></unknown-element></transparent-element></span>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	it("should report error when label contains non-phrasing", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<label><div>foobar</div></label>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"element-permitted-content",
			"Element <div> is not permitted as content in <label>"
		);
	});

	describe("requiredAncestor", () => {
		it("should report error for missing required ancestor", () => {
			expect.assertions(2);
			const markup = "<div><dt>foo</dt></div>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveError(
				"element-permitted-content",
				'Element <dt> requires an "dl > dt" ancestor'
			);
		});

		it("should not report error for proper required ancestor", () => {
			expect.assertions(1);
			const markup = "<dl><div><dt>foo</dt></div></dl>";
			const report = htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	it("should handle missing meta entry (child)", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<p><foo>foo</foo></p>");
		expect(report).toBeValid();
	});

	it("should handle missing meta entry (parent)", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateString("<foo><p>foo</p></foo>");
		expect(report).toBeValid();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("element-permitted-content")).toMatchSnapshot();
	});
});
