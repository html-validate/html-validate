import { beforeAll, describe, expect, it } from "@jest/globals";
import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule close-order", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "close-order": "error" },
		});
	});

	it("should not report when elements are correct", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for self-closing element", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<input />
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for self-closing element with attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<input required />
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for void element", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<!-- prettier-ignore -->
				<input>
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for void element with attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div>
				<!-- prettier-ignore -->
				<input required>
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for implicitly closed element", async () => {
		expect.assertions(1);
		const markup = `
			<ul>
				<li>
			</ul>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for element with optional end tag", async () => {
		expect.assertions(1);
		/* HTML allows omitting </html>, </head>, and </body> */
		const markup = `
			<html>
				<head>
					<title>test</title>
				<body>
					<p>content</p>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when `</html>` end tag is omitted", async () => {
		expect.assertions(1);
		const markup = `
			<html>
				<head>
					<title>test</title>
				</head>
				<body>
					<p>content</p>
				</body>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when `</body>` end tag is omitted", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<html>
				<head><title>test</title></head>
				<body><p>content</p>
			</html>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when `<head>` start tag is omitted", async () => {
		expect.assertions(1);
		/* HTML allows omitting `<head>`—it is implicitly opened for metadata content */
		const markup = /* HTML */ `
			<html lang="en">
				<title>test</title>
				<body>
					<p>content</p>
				</body>
			</html>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when both `<head>` and `<body>` start tags are omitted", async () => {
		expect.assertions(1);
		/* HTML allows omitting both start tags entirely */
		const markup = /* HTML */ `
			<html lang="en">
				<title>test</title>
				<p>content</p>
			</html>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when element is missing opening tag (root)", async () => {
		expect.assertions(2);
		const markup = `
				<label></label>
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Stray end tag '</div>' (close-order)
			  1 |
			  2 | 				<label></label>
			> 3 | 			</div>
			    | 			 ^^^^
			  4 |
			Selector: -"
		`);
	});

	it("should report error when element is missing opening tag (wrapped)", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<main>
					<label></label>
				</div>
			</main>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Stray end tag '</div>' (close-order)
			  2 | 			<main>
			  3 | 					<label></label>
			> 4 | 				</div>
			    | 				 ^^^^
			  5 | 			</main>
			  6 |
			Selector: -"
		`);
	});

	it("should report error when element is missing close tag (root)", async () => {
		expect.assertions(2);
		const markup = `
			<div>
				<h1>Lorem <em>ipsum</em>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Unclosed element '<div>' (close-order)
			  1 |
			> 2 | 			<div>
			    | 			 ^^^
			  3 | 				<h1>Lorem <em>ipsum</em>
			  4 |
			Selector: div
			error: Unclosed element '<h1>' (close-order)
			  1 |
			  2 | 			<div>
			> 3 | 				<h1>Lorem <em>ipsum</em>
			    | 				 ^^
			  4 |
			Selector: div > h1"
		`);
	});

	it("should report error when element is missing close tag (wrapped)", async () => {
		expect.assertions(2);
		const markup = `
			<main>
				<div>
					<h1>Lorem <em>ipsum</em>
			</main>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Unclosed element '<div>' (close-order)
			  1 |
			  2 | 			<main>
			> 3 | 				<div>
			    | 				 ^^^
			  4 | 					<h1>Lorem <em>ipsum</em>
			  5 | 			</main>
			  6 |
			Selector: main > div
			error: Unclosed element '<h1>' (close-order)
			  2 | 			<main>
			  3 | 				<div>
			> 4 | 					<h1>Lorem <em>ipsum</em>
			    | 					 ^^
			  5 | 			</main>
			  6 |
			Selector: main > div > h1
			error: End tag '</main>' seen but there were open elements (close-order)
			  3 | 				<div>
			  4 | 					<h1>Lorem <em>ipsum</em>
			> 5 | 			</main>
			    | 			 ^^^^^
			  6 |
			Selector: -"
		`);
	});

	it("should report error when elements have wrong end tag (root)", async () => {
		expect.assertions(2);
		const markup = `
			<h1>
				lorem ipsum <em></em>
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Unclosed element '<h1>' (close-order)
			  1 |
			> 2 | 			<h1>
			    | 			 ^^
			  3 | 				lorem ipsum <em></em>
			  4 | 			</div>
			  5 |
			Selector: h1
			error: Stray end tag '</div>' (close-order)
			  2 | 			<h1>
			  3 | 				lorem ipsum <em></em>
			> 4 | 			</div>
			    | 			 ^^^^
			  5 |
			Selector: -"
		`);
	});

	it("should report error when elements have wrong end tag (wrapped)", async () => {
		expect.assertions(2);
		const markup = `
			<main>
				<h1>
					lorem ipsum <em></em>
				</div>
			</main>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Unclosed element '<h1>' (close-order)
			  1 |
			  2 | 			<main>
			> 3 | 				<h1>
			    | 				 ^^
			  4 | 					lorem ipsum <em></em>
			  5 | 				</div>
			  6 | 			</main>
			Selector: main > h1
			error: Stray end tag '</div>' (close-order)
			  3 | 				<h1>
			  4 | 					lorem ipsum <em></em>
			> 5 | 				</div>
			    | 				 ^^^^
			  6 | 			</main>
			  7 |
			Selector: -
			error: End tag '</main>' seen but there were open elements (close-order)
			  4 | 					lorem ipsum <em></em>
			  5 | 				</div>
			> 6 | 			</main>
			    | 			 ^^^^^
			  7 |
			Selector: -"
		`);
	});

	it("should report error when elements are closed out of order (root)", async () => {
		expect.assertions(2);
		const markup = `
			<div>
				<label>
			</div>
				</label>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Unclosed element '<label>' (close-order)
			  1 |
			  2 | 			<div>
			> 3 | 				<label>
			    | 				 ^^^^^
			  4 | 			</div>
			  5 | 				</label>
			  6 |
			Selector: div > label
			error: End tag '</div>' seen but there were open elements (close-order)
			  2 | 			<div>
			  3 | 				<label>
			> 4 | 			</div>
			    | 			 ^^^^
			  5 | 				</label>
			  6 |
			Selector: -"
		`);
	});

	it("should report error when elements are closed out of order (wrapped)", async () => {
		expect.assertions(2);
		const markup = `
			<main>
				<div>
					<label>
				</div>
					</label>
			</main>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Unclosed element '<label>' (close-order)
			  2 | 			<main>
			  3 | 				<div>
			> 4 | 					<label>
			    | 					 ^^^^^
			  5 | 				</div>
			  6 | 					</label>
			  7 | 			</main>
			Selector: main > div > label
			error: End tag '</div>' seen but there were open elements (close-order)
			  3 | 				<div>
			  4 | 					<label>
			> 5 | 				</div>
			    | 				 ^^^^
			  6 | 					</label>
			  7 | 			</main>
			  8 |
			Selector: -
			error: End tag '</main>' seen but there were open elements (close-order)
			  5 | 				</div>
			  6 | 					</label>
			> 7 | 			</main>
			    | 			 ^^^^^
			  8 |
			Selector: -"
		`);
	});

	it("should report error when implicitly closed element is also explicitly closed (root)", async () => {
		expect.assertions(2);
		const markup = `
			<p>
				<address></address>
				<address></address>
			</p>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Stray end tag '</p>' (close-order)
			  3 | 				<address></address>
			  4 | 				<address></address>
			> 5 | 			</p>
			    | 			 ^^
			  6 |
			Selector: -"
		`);
	});

	it("should report error when implicitly closed element is also explicitly closed (wrapped)", async () => {
		expect.assertions(2);
		const markup = `
			<main>
				<p>
					<address></address>
					<address></address>
				</p>
			</main>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Stray end tag '</p>' (close-order)
			  4 | 					<address></address>
			  5 | 					<address></address>
			> 6 | 				</p>
			    | 				 ^^
			  7 | 			</main>
			  8 |
			Selector: -"
		`);
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/close-order.html");
		expect(report).toMatchInlineCodeframe(`
			"error: Stray end tag '</div>' (close-order)
			  4 | 	<input>
			  5 | </div>
			> 6 | <p>Lorem ipsum</div>
			    |                ^^^^
			  7 |
			  8 | <ul>
			  9 | 	<li>lorem ipsum
			Selector: -
			error: Stray end tag '</li>' (close-order)
			  10 | 	<li>dolor sit amet
			  11 | </ul>
			> 12 | </li>
			     |  ^^^
			  13 |
			Selector: -"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("close-order");
		expect(docs).toMatchSnapshot();
	});
});
