import HtmlValidate from "../htmlvalidate";
import "../jest";

describe("rule close-order", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "close-order": "error" },
		});
	});

	it("should not report when elements are correct in wrong order", () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div></div> `;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for self-closing element", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<input />
			</div>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for self-closing element with attribute", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<input required />
			</div>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for void element", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<!-- prettier-ignore -->
				<input>
			</div>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for void element with attribute", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<!-- prettier-ignore -->
				<input required>
			</div>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for implicitly closed element", () => {
		expect.assertions(1);
		const markup = `
			<ul>
				<li>
			</ul>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when elements are closed in wrong order", () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<div></p>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"close-order",
			"Mismatched close-tag, expected '</div>' but found '</p>'."
		);
	});

	it("should report error when element is missing close tag", () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<!-- prettier-ignore -->
			<div>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"close-order",
			"Missing close-tag, expected '</div>' but document ended before it was found."
		);
	});

	it("should report error when element is missing opening tag", () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			</div>
		`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("close-order", "Unexpected close-tag, expected opening tag.");
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/close-order.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("close-order")).toMatchSnapshot();
	});
});
