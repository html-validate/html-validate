import HtmlValidate from "../htmlvalidate";
import "../jest";

describe("missing rule", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { foo: "error" },
		});
	});

	it("should report error when rule is not defined", () => {
		expect.assertions(2);
		const report = htmlvalidate.validateString("<p></p>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("foo", "Definition for rule 'foo' was not found");
	});
});
