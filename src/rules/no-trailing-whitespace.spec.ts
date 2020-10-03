import HtmlValidate from "../htmlvalidate";
import "../matchers";

describe("rule no-trailing-whitespace", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "no-trailing-whitespace": "error" },
		});
	});

	describe.each`
		newline   | description
		${"\n"}   | ${"LR"}
		${"\r\n"} | ${"CRLF"}
	`("$description", ({ newline }) => {
		it("should not report when there is no trailing whitespace", () => {
			expect.assertions(1);
			const report = htmlvalidate.validateString(`<div>${newline}  foo${newline}</div>`);
			expect(report).toBeValid();
		});

		it("should report error when tag have trailing whitespace", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString(`<p>  ${newline}</p>`);
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-trailing-whitespace", "Trailing whitespace");
		});

		it("should report error when empty line have trailing whitespace", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString(`<p>${newline}  \n</p>`);
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-trailing-whitespace", "Trailing whitespace");
		});

		it("should report error for both tabs and spaces", () => {
			expect.assertions(2);
			const report = htmlvalidate.validateString("<p>\n  \n\t\n</p>");
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([
				["no-trailing-whitespace", "Trailing whitespace"],
				["no-trailing-whitespace", "Trailing whitespace"],
			]);
		});
	});

	it("smoketest", () => {
		expect.assertions(1);
		const report = htmlvalidate.validateFile("test-files/rules/no-trailing-whitespace.html");
		expect(report.results).toMatchSnapshot();
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		expect(htmlvalidate.getRuleDocumentation("no-trailing-whitespace")).toMatchSnapshot();
	});
});
