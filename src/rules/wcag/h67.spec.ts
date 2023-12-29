import { HtmlValidate } from "../../htmlvalidate";
import "../../jest";

describe("wcag/h67", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "wcag/h67": "error" },
		});
	});

	it("should not report when img has neither alt or title", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <img /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when img is missing title", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <img alt="foo" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when img has both alt and title", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <img alt="foo" title="bar" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when both alt and title is empty", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <img alt="" title="" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when img has only title", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <img title="bar" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <img> with empty alt text cannot have title attribute (wcag/h67) at inline:1:7:
			> 1 |  <img title="bar" />
			    |       ^^^^^
			Selector: img"
		`);
	});

	it("should report error when img has empty alt and non-empty title", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <img alt="" title="bar" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <img> with empty alt text cannot have title attribute (wcag/h67) at inline:1:14:
			> 1 |  <img alt="" title="bar" />
			    |              ^^^^^
			Selector: img"
		`);
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/wcag/h67.html");
		expect(report).toMatchInlineCodeframe(`
			"error: <img> with empty alt text cannot have title attribute (wcag/h67) at test-files/rules/wcag/h67.html:5:6:
			  3 | <img alt="foo" title="bar">
			  4 | <img title="">
			> 5 | <img title="bar">
			    |      ^^^^^
			  6 | <img alt="" title="bar">
			  7 |
			  8 | <!-- regression #33 (https://gitlab.com/html-validate/html-validate/issues/33) -->
			Selector: img:nth-child(5)
			error: <img> with empty alt text cannot have title attribute (wcag/h67) at test-files/rules/wcag/h67.html:6:13:
			  4 | <img title="">
			  5 | <img title="bar">
			> 6 | <img alt="" title="bar">
			    |             ^^^^^
			  7 |
			  8 | <!-- regression #33 (https://gitlab.com/html-validate/html-validate/issues/33) -->
			  9 | <div>
			Selector: img:nth-child(6)"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h67": "error" },
		});
		const docs = await htmlvalidate.getContextualDocumentation({ ruleId: "wcag/h67" });
		expect(docs).toMatchSnapshot();
	});
});
