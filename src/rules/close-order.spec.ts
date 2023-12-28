import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule close-order", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "close-order": "error" },
		});
	});

	it("should not report when elements are correct in wrong order", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for self-closing element", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<input />
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for self-closing element with attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<input required />
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for void element", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<!-- prettier-ignore -->
				<input>
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for void element with attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<!-- prettier-ignore -->
				<input required>
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for implicitly closed element", async () => {
		expect.assertions(1);
		const markup = `
			<ul>
				<li>
			</ul>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when elements are closed in wrong order", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<div></p>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Mismatched close-tag, expected '</div>' but found '</p>' (close-order) at inline:2:10:
			  1 |
			> 2 | 			<div></p>
			    | 			      ^^
			  3 |
			Selector: -"
		`);
	});

	it("should report error when element is missing close tag", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<!-- prettier-ignore -->
			<div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Missing close-tag, expected '</div>' but document ended before it was found (close-order) at inline:4:3:
			  2 | 			<!-- prettier-ignore -->
			  3 | 			<div>
			> 4 |
			    | 		^
			Selector: -"
		`);
	});

	it("should report error when element is missing opening tag", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Unexpected close-tag, expected opening tag (close-order) at inline:2:5:
			  1 |
			> 2 | 			</div>
			    | 			 ^^^^
			  3 |
			Selector: -"
		`);
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/close-order.html");
		expect(report).toMatchInlineCodeframe(`
			"error: Mismatched close-tag, expected '</p>' but found '</div>' (close-order) at test-files/rules/close-order.html:6:16:
			  4 | 	<input>
			  5 | </div>
			> 6 | <p>Lorem ipsum</div>
			    |                ^^^^
			  7 |
			  8 | <ul>
			  9 | 	<li>lorem ipsum
			Selector: -
			error: Unexpected close-tag, expected opening tag (close-order) at test-files/rules/close-order.html:12:2:
			  10 | 	<li>dolor sit amet
			  11 | </ul>
			> 12 | </li>
			     |  ^^^
			  13 |
			Selector: -"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("close-order");
		expect(docs).toMatchSnapshot();
	});
});
