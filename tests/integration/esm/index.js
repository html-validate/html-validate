import assert from "node:assert";
import { HtmlValidate } from "html-validate";

async function run() {
	const htmlvalidate = new HtmlValidate({
		root: true,
		extends: ["html-validate:recommended"],
		elements: ["html5"],
	});
	const report = await htmlvalidate.validateString("<div>lorem ipsum");

	assert.equal(report.valid, false, "Report should be invalid");
	assert.equal(report.errorCount, 1, "Report should have 1 error");
	assert.deepEqual(report.results[0].messages[0], {
		ruleId: "close-order",
		ruleUrl: "https://html-validate.org/rules/close-order.html",
		severity: 2,
		message: "Unclosed element '<div>'",
		offset: 1,
		line: 1,
		column: 2,
		size: 3,
		selector: "div",
	});
}

run().catch((err) => {
	/* eslint-disable-next-line no-console -- expected to log */
	console.error(err);
	process.exitCode = 1;
});
