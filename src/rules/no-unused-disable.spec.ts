import "../jest";
import { HtmlValidate } from "../htmlvalidate";
import { type Plugin } from "../plugin";
import { Rule } from "../rule";
import { staticResolver } from "../config";
import { StaticConfigLoader } from "../browser";
import { type RuleContext } from "./no-unused-disable";

class DirectRule extends Rule {
	public setup(): void {
		this.on("attr", () => {
			this.report(null, "cannot use attribute");
		});
	}
}

class IndirectRule extends Rule {
	public setup(): void {
		this.on("dom:ready", ({ document }) => {
			const elements = document.querySelectorAll("div");
			for (const element of elements) {
				this.report(element, "cannot use <div> elements");
			}
		});
	}
}

const plugin: Plugin = {
	name: "mock-plugin",
	rules: {
		direct: DirectRule,
		indirect: IndirectRule,
	},
};

const resolver = staticResolver({
	plugins: {
		"mock-plugin": plugin,
	},
});

describe("rule no-unused-disable", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		const loader = new StaticConfigLoader([resolver], {
			root: true,
			plugins: ["mock-plugin"],
			rules: {
				direct: "error",
				indirect: "error",
				"element-case": "error",
				"no-unused-disable": "error",
			},
		});
		htmlvalidate = new HtmlValidate(loader);
	});

	it("should not report error when disable-block is used to disable reported error", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<!-- [html-validate-disable-block direct, indirect] -->
			<div attr></div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when disable-next is used to disable reported error", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<!-- [html-validate-disable-next direct, indirect] -->
			<div attr></div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when no-unused-disable is disabled by itself", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<main>
				<!-- [html-validate-disable-block direct, indirect, no-unused-disable] -->
				<p></p>
			</main>

			<!-- [html-validate-disable-next direct, indirect, no-unused-disable] -->
			<p></p>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when disable-block is used to disable unused error", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<main>
				<!-- [html-validate-disable-block direct, indirect] -->
				<p></p>
			</main>

			<!-- these errors should still be reported but not affect the above disable -->
			<div attr></div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "direct" rule is disabled but no error was reported (no-unused-disable) at inline:3:39:
			  1 |
			  2 | 			<main>
			> 3 | 				<!-- [html-validate-disable-block direct, indirect] -->
			    | 				                                  ^^^^^^
			  4 | 				<p></p>
			  5 | 			</main>
			  6 |
			Selector: -
			error: "indirect" rule is disabled but no error was reported (no-unused-disable) at inline:3:47:
			  1 |
			  2 | 			<main>
			> 3 | 				<!-- [html-validate-disable-block direct, indirect] -->
			    | 				                                          ^^^^^^^^
			  4 | 				<p></p>
			  5 | 			</main>
			  6 |
			Selector: -
			error: cannot use <div> elements (indirect) at inline:8:5:
			  6 |
			  7 | 			<!-- these errors should still be reported but not affect the above disable -->
			> 8 | 			<div attr></div>
			    | 			 ^^^
			  9 |
			Selector: div
			error: cannot use attribute (direct) at inline:8:9:
			  6 |
			  7 | 			<!-- these errors should still be reported but not affect the above disable -->
			> 8 | 			<div attr></div>
			    | 			     ^^^^
			  9 |
			Selector: -"
		`);
	});

	it("should report error when disable-next is used to disable unused error", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<!-- [html-validate-disable-next direct, indirect] -->
			<p></p>

			<!-- these errors should still be reported but not affect the above disable -->
			<div attr></div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "direct" rule is disabled but no error was reported (no-unused-disable) at inline:2:37:
			  1 |
			> 2 | 			<!-- [html-validate-disable-next direct, indirect] -->
			    | 			                                 ^^^^^^
			  3 | 			<p></p>
			  4 |
			  5 | 			<!-- these errors should still be reported but not affect the above disable -->
			Selector: -
			error: "indirect" rule is disabled but no error was reported (no-unused-disable) at inline:2:45:
			  1 |
			> 2 | 			<!-- [html-validate-disable-next direct, indirect] -->
			    | 			                                         ^^^^^^^^
			  3 | 			<p></p>
			  4 |
			  5 | 			<!-- these errors should still be reported but not affect the above disable -->
			Selector: -
			error: cannot use <div> elements (indirect) at inline:6:5:
			  4 |
			  5 | 			<!-- these errors should still be reported but not affect the above disable -->
			> 6 | 			<div attr></div>
			    | 			 ^^^
			  7 |
			Selector: div
			error: cannot use attribute (direct) at inline:6:9:
			  4 |
			  5 | 			<!-- these errors should still be reported but not affect the above disable -->
			> 6 | 			<div attr></div>
			    | 			     ^^^^
			  7 |
			Selector: -"
		`);
	});

	it("should report correct location for multiple rules", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<!-- [html-validate-disable-next direct, indirect, element-case] -->
			<p></p>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "direct" rule is disabled but no error was reported (no-unused-disable) at inline:2:37:
			  1 |
			> 2 | 			<!-- [html-validate-disable-next direct, indirect, element-case] -->
			    | 			                                 ^^^^^^
			  3 | 			<p></p>
			  4 |
			Selector: -
			error: "indirect" rule is disabled but no error was reported (no-unused-disable) at inline:2:45:
			  1 |
			> 2 | 			<!-- [html-validate-disable-next direct, indirect, element-case] -->
			    | 			                                         ^^^^^^^^
			  3 | 			<p></p>
			  4 |
			Selector: -
			error: "element-case" rule is disabled but no error was reported (no-unused-disable) at inline:2:55:
			  1 |
			> 2 | 			<!-- [html-validate-disable-next direct, indirect, element-case] -->
			    | 			                                                   ^^^^^^^^^^^^
			  3 | 			<p></p>
			  4 |
			Selector: -"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(2);
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-unused-disable": "error" },
		});
		const context: RuleContext = {
			ruleId: "mock-rule",
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "no-unused-disable",
			context,
		});
		expect(docs?.description).toMatchInlineSnapshot(
			`"\`mock-rule\` rule is disabled but no error was reported."`,
		);
		expect(docs?.url).toMatchInlineSnapshot(
			`"https://html-validate.org/rules/no-unused-disable.html"`,
		);
	});
});
