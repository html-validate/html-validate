import HtmlValidate from "../htmlvalidate";
import "../matchers";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule script-type", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "script-type": "error" },
		});
	});

	it("should not report when script element has implied type", () => {
		const report = htmlvalidate.validateString("<script></script>");
		expect(report).toBeValid();
	});

	it("should not report when script element has module type", () => {
		const report = htmlvalidate.validateString(
			'<script type="module"></script>'
		);
		expect(report).toBeValid();
	});

	it("should not report when script element has non-js type", () => {
		const report = htmlvalidate.validateString(
			'<script type="text/plain"></script>'
		);
		expect(report).toBeValid();
	});

	it("should not report error for dynamic attributes", () => {
		const report = htmlvalidate.validateString(
			'<script dynamic-type="type">',
			null,
			{
				processAttribute,
			}
		);
		expect(report).toBeValid();
	});

	it("should report when script element have empty type", () => {
		const report = htmlvalidate.validateString('<script type=""></script>');
		expect(report).toHaveError(
			"script-type",
			'"type" attribute is unnecessary for javascript resources'
		);
	});

	it("should report when script element have javascript type", () => {
		const report = htmlvalidate.validateString(
			'<script type="text/javascript"></script>'
		);
		expect(report).toHaveError(
			"script-type",
			'"type" attribute is unnecessary for javascript resources'
		);
	});

	it("should report when script element have legacy javascript type", () => {
		const report = htmlvalidate.validateString(
			'<script type="text/javascript"></script>'
		);
		expect(report).toHaveError(
			"script-type",
			'"type" attribute is unnecessary for javascript resources'
		);
	});

	it("should contain documentation", () => {
		expect(htmlvalidate.getRuleDocumentation("script-type")).toMatchSnapshot();
	});
});
