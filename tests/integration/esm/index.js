import assert from "assert";
import { HtmlValidate } from "html-validate"; // eslint-disable-line import/no-unresolved, import/named

const htmlvalidate = new HtmlValidate({
	root: true,
	extends: ["html-validate:recommended"],
	elements: ["html5"],
});
const report = htmlvalidate.validateString("<p>lorem ipsum</i>");

assert.equal(report.valid, false, "Report should be invalid");
assert.equal(report.errorCount, 1, "Report should have 1 error");
assert.deepEqual(report.results[0].messages[0], {
	ruleId: "close-order",
	ruleUrl: "https://html-validate.org/rules/close-order.html",
	severity: 2,
	message: "Mismatched close-tag, expected '</p>' but found '</i>'.",
	offset: 15,
	line: 1,
	column: 16,
	size: 2,
	selector: null,
});
