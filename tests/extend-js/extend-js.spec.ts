import path from "path";
import HtmlValidate from "../../src/htmlvalidate";
import "../../src/matchers";

it("should handle extending js file", () => {
	expect.assertions(2);
	const htmlvalidate = new HtmlValidate();
	const report = htmlvalidate.validateFile(
		path.join(__dirname, "my-file.html")
	);
	expect(report).toBeInvalid();
	expect(report.results[0].messages).toMatchInlineSnapshot(`
		Array [
		  Object {
		    "column": 16,
		    "context": undefined,
		    "line": 1,
		    "message": "Mismatched close-tag, expected '</p>' but found '</i>'.",
		    "offset": 15,
		    "ruleId": "close-order",
		    "selector": null,
		    "severity": 2,
		    "size": 2,
		  },
		]
	`);
});
