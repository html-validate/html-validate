import { DOMNode } from "./domnode";

describe("DOMNode", () => {
	it("root element", () => {
		const node = new DOMNode(null);
		expect(node.nodeName).toEqual("#document");
	});

	describe("isRootElement()", () => {
		it("should return true for root element", () => {
			const node = new DOMNode(null);
			expect(node.isRootElement()).toBeTruthy();
		});
		it("should false true for other element", () => {
			const node = new DOMNode("foo");
			expect(node.isRootElement()).toBeFalsy();
		});
	});

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
