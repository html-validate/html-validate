import { reportOk, reportError } from "./__fixtures__";
import "../jest";

describe("toMatchInlineCodeframe()", () => {
	it("should match valid report", () => {
		expect.assertions(1);
		expect(reportOk()).toMatchInlineCodeframe(`""`);
	});

	it("should match invalid report", () => {
		expect.assertions(1);
		expect(reportError()).toMatchInlineCodeframe(`
		"error: mock message (my-rule) at inline:4:8:
		  2 | 		<header id=\\"foo\\">
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
