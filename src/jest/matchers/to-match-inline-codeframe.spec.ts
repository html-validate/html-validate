import { reportOk, reportError, reportOkAsync, reportErrorAsync } from "./__fixtures__";
import "../jest";

describe("toMatchInlineCodeframe()", () => {
	it("should match valid report", () => {
		expect.assertions(1);
		expect(reportOk()).toMatchInlineCodeframe(`""`);
	});

	it("should match valid async report", () => {
		expect.assertions(1);
		expect(reportOkAsync()).toMatchInlineCodeframe(`""`);
	});

	it("should match valid string", () => {
		expect.assertions(1);
		expect("<p></p>").toMatchInlineCodeframe(`""`);
	});

	it("should match invalid report", () => {
		expect.assertions(1);
		expect(reportError()).toMatchInlineCodeframe(`
			"error: mock message (my-rule) at inline:4:8:
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

	it("should match invalid async report", () => {
		expect.assertions(1);
		expect(reportErrorAsync()).toMatchInlineCodeframe(`
			"error: mock message (my-rule) at inline:4:8:
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

	it("should match invalid string", () => {
		expect.assertions(1);
		expect("<div>").toMatchInlineCodeframe(`
			"error: Unclosed element '<div>' (close-order) at inline:1:2:
			> 1 | <div>
			    |  ^^^
			Selector: div"
		`);
	});
});
