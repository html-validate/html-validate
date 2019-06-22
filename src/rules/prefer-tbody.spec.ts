import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule prefer-tbody", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "prefer-tbody": "error" },
		});
	});

	it("should not report error when <table> has all <tr> wrapped in <tbody>", () => {
		const report = htmlvalidate.validateString(
			"<table><tbody><tr></tr></tbody></table>"
		);
		expect(report).toBeValid();
	});

	it("should not report error when <table> has no <tr>", () => {
		const report = htmlvalidate.validateString("<table></table>");
		expect(report).toBeValid();
	});

	it("should report error when <table> has <tr> without <tbody>", () => {
		const report = htmlvalidate.validateString("<table><tr></tr></table>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"prefer-tbody",
			"Prefer to wrap <tr> elements in <tbody>"
		);
	});

	it("should contain documentation", () => {
		expect(htmlvalidate.getRuleDocumentation("prefer-tbody")).toMatchSnapshot();
	});
});
