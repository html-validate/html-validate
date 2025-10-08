import * as path from "node:path";
import { FileSystemConfigLoader, HtmlValidate } from "../../src/index";
import "../../src/jest";

it("should handle elements js file", async () => {
	expect.assertions(2);
	const loader = new FileSystemConfigLoader();
	const htmlvalidate = new HtmlValidate(loader);
	const report = await htmlvalidate.validateFile(path.join(__dirname, "my-file.html"));
	expect(report).toBeInvalid();
	expect(report.results[0].messages).toMatchInlineSnapshot(`
		[
		  {
		    "column": 2,
		    "context": {
		      "tagName": "my-element",
		    },
		    "line": 1,
		    "message": "<my-element> is deprecated",
		    "offset": 1,
		    "ruleId": "deprecated",
		    "ruleUrl": "https://html-validate.org/rules/deprecated.html",
		    "selector": "my-element",
		    "severity": 2,
		    "size": 10,
		  },
		]
	`);
});
