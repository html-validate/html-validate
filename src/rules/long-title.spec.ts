import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule long-title", () => {
	let htmlvalidate: HtmlValidate;

	it("should report when title has long text", async () => {
		expect.assertions(2);
		htmlvalidate = new HtmlValidate({
			rules: { "long-title": "error" },
		});
		const markup = /* HTML */ `
			<title>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua.
			</title>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("long-title", "title text cannot be longer than 70 characters");
	});

	it("should not report when title has short text", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "long-title": "error" },
		});
		const markup = /* HTML */ ` <title>lorem ipsum</title> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for other elements", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "long-title": "error" },
		});
		const markup =
			"<div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>";
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should support setting custom max length", async () => {
		expect.assertions(2);
		htmlvalidate = new HtmlValidate({
			rules: { "long-title": ["error", { maxlength: 10 }] },
		});
		const markup = /* HTML */ ` <title>lorem ipsum dolor sit amet</title> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toHaveError("long-title", "title text cannot be longer than 10 characters");
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("long-title");
		expect(docs).toMatchSnapshot();
	});
});
