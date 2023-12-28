import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule no-trailing-whitespace", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-trailing-whitespace": "error" },
		});
	});

	describe.each`
		newline   | description
		${"\n"}   | ${"LR"}
		${"\r\n"} | ${"CRLF"}
	`("$description", ({ newline }) => {
		it("should not report when there is no trailing whitespace", async () => {
			expect.assertions(1);
			const report = await htmlvalidate.validateString(`<div>${newline}  foo${newline}</div>`);
			expect(report).toBeValid();
		});

		it("should report error when tag have trailing whitespace", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString(`<p>  ${newline}</p>`);
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-trailing-whitespace", "Trailing whitespace");
		});

		it("should report error when empty line have trailing whitespace", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString(`<p>${newline}  \n</p>`);
			expect(report).toBeInvalid();
			expect(report).toHaveError("no-trailing-whitespace", "Trailing whitespace");
		});

		it("should report error for both tabs and spaces", async () => {
			expect.assertions(2);
			const report = await htmlvalidate.validateString("<p>\n  \n\t\n</p>");
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([
				["no-trailing-whitespace", "Trailing whitespace"],
				["no-trailing-whitespace", "Trailing whitespace"],
			]);
		});
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/no-trailing-whitespace.html");
		expect(report).toMatchCodeframe();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("no-trailing-whitespace");
		expect(docs).toMatchSnapshot();
	});
});
