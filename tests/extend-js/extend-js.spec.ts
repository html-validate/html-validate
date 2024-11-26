import path from "node:path";
import { HtmlValidate } from "../../src/htmlvalidate";
import "../../src/jest";

it("should handle extending js file", async () => {
	expect.assertions(2);
	const htmlvalidate = new HtmlValidate();
	const report = await htmlvalidate.validateFile(path.join(__dirname, "my-file.html"));
	expect(report).toBeInvalid();
	expect(report.results[0].messages).toMatchInlineSnapshot(`
		[
		  {
		    "column": 2,
		    "line": 1,
		    "message": "Unclosed element '<div>'",
		    "offset": 1,
		    "ruleId": "close-order",
		    "ruleUrl": "https://html-validate.org/rules/close-order.html",
		    "selector": "div",
		    "severity": 2,
		    "size": 3,
		  },
		]
	`);
});
