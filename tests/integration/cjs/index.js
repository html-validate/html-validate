const assert = require("node:assert");
const { HtmlValidate } = require("html-validate");

async function run() {
	const htmlvalidate = new HtmlValidate({
		root: true,
		extends: ["html-validate:recommended"],
		elements: ["html5"],
	});
	const report = await htmlvalidate.validateString("<p>lorem ipsum</i>");

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
}

run().catch((err) => {
	/* eslint-disable-next-line no-console -- expected to log */
	console.error(err);
	process.exitCode = 1;
});
