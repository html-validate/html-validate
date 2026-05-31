import { describe, expect, it } from "vitest";
import {
	reportError,
	reportErrorAsync,
	reportOk,
	reportOkAsync,
	reportWarning,
} from "./__fixtures__";
import { toMatchInlineCodeframe } from "./to-match-inline-codeframe";

expect.extend({
	toMatchInlineCodeframe: toMatchInlineCodeframe(),
});

describe("toMatchInlineCodeframe()", () => {
	it("should match valid report", async () => {
		expect.assertions(1);
		await expect(reportOk()).toMatchInlineCodeframe(`""`);
	});

	it("should match valid async report", async () => {
		expect.assertions(1);
		await expect(reportOkAsync()).toMatchInlineCodeframe(`""`);
	});

	it("should match valid string", async () => {
		expect.assertions(1);
		await expect("<p></p>").toMatchInlineCodeframe(`""`);
	});

	it("should match invalid report", async () => {
		expect.assertions(1);
		await expect(reportError()).toMatchInlineCodeframe(`
			"error: mock message (my-rule)
			  2 | 		<header id="foo">
			  3 | 			<div>
			> 4 | 				<p>lorem ipsum</p>
			    | 				   ^^^^^^^^^^^
			  5 | 			</div>
			  6 | 		</header>
			  7 |
			Selector: #foo > div"
		`);
	});

	it("should match invalid async report", async () => {
		expect.assertions(1);
		await expect(reportErrorAsync()).toMatchInlineCodeframe(`
			"error: mock message (my-rule)
			  2 | 		<header id="foo">
			  3 | 			<div>
			> 4 | 				<p>lorem ipsum</p>
			    | 				   ^^^^^^^^^^^
			  5 | 			</div>
			  6 | 		</header>
			  7 |
			Selector: #foo > div"
		`);
	});

	it("should match invalid string", async () => {
		expect.assertions(1);
		await expect("<div>").toMatchInlineCodeframe(`
			"error: Unclosed element '<div>' (close-order)
			> 1 | <div>
			    |  ^^^
			Selector: div"
		`);
	});

	it("should match warning report", async () => {
		expect.assertions(1);
		await expect(reportWarning()).toMatchInlineCodeframe(`
			"warning: mock message (my-rule)
			  2 | 		<header id="foo">
			  3 | 			<div>
			> 4 | 				<p>lorem ipsum</p>
			    | 				   ^^^^^^^^^^^
			  5 | 			</div>
			  6 | 		</header>
			  7 |
			Selector: #foo > div"
		`);
	});
});
