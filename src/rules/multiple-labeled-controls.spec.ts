import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule multiple-labeled-controls", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "multiple-labeled-controls": "error" },
		});
	});

	it("should not report when <label> has no controls", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <label></label> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when <label> has one wrapped control", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label>
				<input />
			</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when <label> has one referenced control", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for="foo"></label>
			<input id="foo" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when <label> both references and wraps a single control", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for="foo">
				<input id="foo" />
			</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error for other elements", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<custom-element for="bar">
				<input id="foo" />
			</custom-element>
			<input id="bar" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should not report error when <label> have <input type="hidden">', async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label>
				<input type="hidden" />
				<input type="checkbox" />
			</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when <label> have multiple wrapped controls", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<label>
				<input />
				<input />
			</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <label> is associated with multiple controls (multiple-labeled-controls) at inline:2:5:
			  1 |
			> 2 | 			<label>
			    | 			 ^^^^^
			  3 | 				<input />
			  4 | 				<input />
			  5 | 			</label>
			Selector: label"
		`);
	});

	it("should report error when <label> have both for attribute and another wrapped control", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<label for="bar">
				<input id="foo" />
			</label>
			<input id="bar" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <label> is associated with multiple controls (multiple-labeled-controls) at inline:2:5:
			  1 |
			> 2 | 			<label for="bar">
			    | 			 ^^^^^
			  3 | 				<input id="foo" />
			  4 | 			</label>
			  5 | 			<input id="bar" />
			Selector: label"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("multiple-labeled-controls");
		expect(docs).toMatchSnapshot();
	});
});
