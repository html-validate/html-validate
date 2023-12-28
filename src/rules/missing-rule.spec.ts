import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("missing rule", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { foo: "error" },
		});
	});

	it("should report error when rule is not defined", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <p></p> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("foo", "Definition for rule 'foo' was not found");
	});
});
