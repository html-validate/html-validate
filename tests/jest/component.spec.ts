/**
 * @jest-environment jsdom
 */

import "../../src/jest";

it("should validate ok", () => {
	expect.assertions(1);
	expect("<div></div>").toHTMLValidate();
});

it("should not validate", () => {
	expect.assertions(1);
	expect('<div style="color: hotpink;"></div>').not.toHTMLValidate();
});

it("should allow overriding config", () => {
	expect.assertions(1);
	expect('<div style="color: hotpink;"></div>').toHTMLValidate({
		rules: {
			"no-inline-style": "off",
		},
	});
});

it("should read configuration from .htmlvalidate.json", () => {
	/* .htmlvalidate.json configures void with selfclosing */
	expect.assertions(1);
	expect("<br/>").toHTMLValidate();
});
