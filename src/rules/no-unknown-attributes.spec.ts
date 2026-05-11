import { beforeAll, describe, expect, it } from "@jest/globals";
import { HtmlValidate } from "../htmlvalidate";
import type { RuleContext } from "./no-unknown-attributes";
import "../jest";

describe("rule no-unknown-attributes", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "no-unknown-attributes": "error" },
		});
	});

	it("should not report known element-specific attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<input type="text" />`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report known global attribute", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<div id="foo" class="bar" style="color: red" hidden></div>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report for elements without metadata", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<custom-element unknown-attr="value"></custom-element>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report unknown attribute", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<div unknown="value"></div>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Attribute "unknown" is not allowed on <div> element (no-unknown-attributes)
			> 1 | <div unknown="value"></div>
			    |      ^^^^^^^
			Selector: div"
		`);
	});

	it("should report error in original case", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<div UNKNOWN="value"></div>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Attribute "UNKNOWN" is not allowed on <div> element (no-unknown-attributes)
			> 1 | <div UNKNOWN="value"></div>
			    |      ^^^^^^^
			Selector: div"
		`);
	});

	describe("should not report data-* attributes", () => {
		it("lowercase", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div data-foo="bar"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("mixed case", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div data-fooBar="bar"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("should not report aria-* attributes", () => {
		it("aria-label", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div aria-label="accessible name"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("aria-hidden", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div aria-hidden="true"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("should not report on* event handler attributes", () => {
		it("onclick", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div onclick="doSomething()"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("onmouseover", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div onmouseover="doSomething()"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("should not report Vue.js framework attributes", () => {
		it(":bind shorthand", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div :class="myClass"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("@event shorthand", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div @click="handleClick"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("v-if directive", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div v-if="show"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("v-bind directive", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div v-bind:id="myId"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("should not report Angular framework attributes", () => {
		it("[property] binding", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div [ngClass]="myClass"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("ng- directive", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div ng-if="show"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("should not report Alpine.js attributes", () => {
		it("x-show", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div x-show="isVisible"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("x-bind:attr", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div x-bind:class="myClass"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	describe("should not report XML namespace attributes", () => {
		it("xml:lang", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<div xml:lang="en"></div>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});

		it("xmlns:xlink", async () => {
			expect.assertions(1);
			const markup = /* HTML */ `<svg xmlns:xlink="http://www.w3.org/1999/xlink"></svg>`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeValid();
		});
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const context: RuleContext = {
			tagName: "div",
			attr: "unknown",
		};
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "no-unknown-attributes",
			context,
		});
		expect(docs?.description).toMatchInlineSnapshot(
			`"The \`unknown\` attribute is not a known attribute on \`<div>\`."`,
		);
	});
});
