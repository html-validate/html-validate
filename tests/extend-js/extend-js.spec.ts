import path from "path";
import HtmlValidate from "../../src/htmlvalidate";
import "../../src/jest";

it("should handle extending js file", () => {
	expect.assertions(2);
	const htmlvalidate = new HtmlValidate();
	const report = htmlvalidate.validateFile(path.join(__dirname, "my-file.html"));
	expect(report).toBeInvalid();
	expect(report.results[0].messages).toMatchInlineSnapshot(`
		[
		  {
		    "column": 16,
		    "context": undefined,
		    "line": 1,
		    "message": "Mismatched close-tag, expected '</p>' but found '</i>'.",
		    "offset": 15,
		    "ruleId": "close-order",
		    "ruleUrl": "https://html-validate.org/rules/close-order.html",
		    "selector": null,
		    "severity": 2,
		    "size": 2,
		  },
		]
	`);
});
