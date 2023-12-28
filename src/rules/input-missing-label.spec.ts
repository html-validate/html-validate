import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule input-missing-label", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "input-missing-label": "error" },
		});
	});

	it("should not report when input id has matching label", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for="foo"> lorem ipsum </label>
			<input id="foo" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should not report when input type="hidden" is missing label', async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input type="hidden" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it('should not report when input type="submit" is missing label', async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<input type="submit" />');
		expect(report).toBeValid();
	});

	it('should not report when input type="reset" is missing label', async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<input type="reset" />');
		expect(report).toBeValid();
	});

	it('should not report when input type="button" is missing label', async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateString('<input type="button" />');
		expect(report).toBeValid();
	});

	it("should not report when input is nested inside label", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label>
				foo
				<input />
			</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when input is nested inside label with aria-label", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label aria-label="lorem ipsum">
				<input />
			</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when input is nested inside label with aria-labelledby", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<p id="foo">lorem ipsum</p>
			<label aria-labelledby="foo">
				<input />
			</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when input is hidden", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input hidden /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when input is aria-hidden", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <input aria-hidden="true" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle multiple labels", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for="foo"> foo </label>
			<label for="foo"> bar </label>
			<input id="foo" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should handle colon in id", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for=":r1:">lorem ipsum</label>
			<input id=":r1:" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when at least one label is accessible", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<label for="foo" aria-hidden="true">foo</label>
			<label for="foo">bar</label>
			<input id="foo" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report when <input> is missing label", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <input /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <input> element does not have a <label> (input-missing-label) at inline:1:3:
			> 1 |  <input />
			    |   ^^^^^
			Selector: input"
		`);
	});

	it("should report when <input> have empty label", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<label for="foo"></label>
			<input id="foo" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <input> element has <label> but <label> has no text (input-missing-label) at inline:3:5:
			  1 |
			  2 | 			<label for="foo"></label>
			> 3 | 			<input id="foo" />
			    | 			 ^^^^^
			  4 |
			Selector: #foo"
		`);
	});

	it("should report when <input> have empty aria-label", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <input aria-label="" /> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
		"error: <input> element has aria-label but label has no text (input-missing-label) at inline:1:3:
		> 1 |  <input aria-label="" />
		    |   ^^^^^
		Selector: input"
	`);
	});

	it("should report when <input> has reference to empty element", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<p id="foo"></p>
			<input aria-labelledby="foo" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
		"error: <input> element has aria-labelledby but referenced element has no text (input-missing-label) at inline:3:5:
		  1 |
		  2 | 			<p id="foo"></p>
		> 3 | 			<input aria-labelledby="foo" />
		    | 			 ^^^^^
		  4 |
		Selector: input"
	`);
	});

	it("should report when input is nested inside label with empty aria-label", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<label aria-label="">
				<input />
			</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <input> element has <label> but <label> has no text (input-missing-label) at inline:3:6:
			  1 |
			  2 | 			<label aria-label="">
			> 3 | 				<input />
			    | 				 ^^^^^
			  4 | 			</label>
			  5 |
			Selector: label > input"
		`);
	});

	it("should report when input is nested inside label referencing empty element", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<p id="foo"></p>
			<label aria-labelledby="foo">
				<input />
			</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <input> element has <label> but <label> has no text (input-missing-label) at inline:4:6:
			  2 | 			<p id="foo"></p>
			  3 | 			<label aria-labelledby="foo">
			> 4 | 				<input />
			    | 				 ^^^^^
			  5 | 			</label>
			  6 |
			Selector: label > input"
		`);
	});

	it("should report when <select> is missing label", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<select>
				<option>foo</option>
				<option>bar</option>
			</select>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <select> element does not have a <label> (input-missing-label) at inline:2:5:
			  1 |
			> 2 | 			<select>
			    | 			 ^^^^^^
			  3 | 				<option>foo</option>
			  4 | 				<option>bar</option>
			  5 | 			</select>
			Selector: select"
		`);
	});

	it("should report when <textarea> is missing label", async () => {
		expect.assertions(2);
		const markup = /* HTML */ ` <textarea>lorem ipsum</textarea> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <textarea> element does not have a <label> (input-missing-label) at inline:1:3:
			> 1 |  <textarea>lorem ipsum</textarea>
			    |   ^^^^^^^^
			Selector: textarea"
		`);
	});

	it("should report error when label is hidden", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<label for="foo" hidden></label>
			<input id="foo" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <input> element has <label> but <label> element is hidden (input-missing-label) at inline:3:5:
			  1 |
			  2 | 			<label for="foo" hidden></label>
			> 3 | 			<input id="foo" />
			    | 			 ^^^^^
			  4 |
			Selector: #foo"
		`);
	});

	it("should report error when label is aria-hidden", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<label for="foo" aria-hidden="true"></label>
			<input id="foo" />
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: <input> element has <label> but <label> element is hidden (input-missing-label) at inline:3:5:
			  1 |
			  2 | 			<label for="foo" aria-hidden="true"></label>
			> 3 | 			<input id="foo" />
			    | 			 ^^^^^
			  4 |
			Selector: #foo"
		`);
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/input-missing-label.html");
		expect(report).toMatchInlineCodeframe(`
			"error: <input> element does not have a <label> (input-missing-label) at test-files/rules/input-missing-label.html:17:3:
			  15 | <!-- missing labels -->
			  16 | <div class="form-group">
			> 17 | 	<input />
			     | 	 ^^^^^
			  18 |
			  19 | 	<select>
			  20 | 		<option>lorem ipsum</option>
			Selector: div:nth-child(3) > input
			error: <select> element does not have a <label> (input-missing-label) at test-files/rules/input-missing-label.html:19:3:
			  17 | 	<input />
			  18 |
			> 19 | 	<select>
			     | 	 ^^^^^^
			  20 | 		<option>lorem ipsum</option>
			  21 | 	</select>
			  22 |
			Selector: div:nth-child(3) > select
			error: <textarea> element does not have a <label> (input-missing-label) at test-files/rules/input-missing-label.html:23:3:
			  21 | 	</select>
			  22 |
			> 23 | 	<textarea>foobar</textarea>
			     | 	 ^^^^^^^^
			  24 | </div>
			  25 |
			Selector: div:nth-child(3) > textarea"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const docs = await htmlvalidate.getRuleDocumentation("input-missing-label");
		expect(docs).toMatchSnapshot();
	});
});
