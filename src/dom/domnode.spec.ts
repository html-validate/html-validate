import { DOMNode } from "./domnode";

describe("DOMNode", () => {
	describe("disabled rules", () => {
		it("rules should default to enabled", () => {
			const node = new DOMNode("foo");
			expect(node.ruleEnabled("my-rule")).toBeTruthy();
		});

		it("disableRule() should disable rule", () => {
			const node = new DOMNode("foo");
			node.disableRule("my-rule");
			expect(node.ruleEnabled("my-rule")).toBeFalsy();
		});

		it("enableRule() should enable rule", () => {
			const node = new DOMNode("foo");
			node.disableRule("my-rule");
			expect(node.ruleEnabled("my-rule")).toBeFalsy();
			node.enableRule("my-rule");
			expect(node.ruleEnabled("my-rule")).toBeTruthy();
		});
	});
});
