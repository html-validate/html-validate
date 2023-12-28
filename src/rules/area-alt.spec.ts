import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import "../jest";
import { RuleContext } from "./area-alt";

describe("rule area-alt", () => {
	let htmlvalidate: HtmlValidate;

	beforeEach(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "area-alt": ["error", { accessible: false }] },
		});
	});

	it("should not report error when <area> has non-empty alt", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<map>
				<area href="target" alt="lorem ipsum" />
			</map>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when <area> without href is missing alt", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<map>
				<area />
			</map>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when <area> with empty alt has sibling with same target and non-empty alt", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<map>
				<area href="foo" alt="" />
				<area href="foo" alt="lorem ipsum" />
			</map>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when <area> has dynamic alt", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <map> <area href="target" dynamic-alt="var" /> </map> `;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should report error when <area> is missing alt", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<map>
				<area href="target" />
			</map>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "alt" attribute must be set and non-empty when the "href" attribute is present (area-alt) at inline:3:11:
			  1 |
			  2 | 			<map>
			> 3 | 				<area href="target" />
			    | 				      ^^^^
			  4 | 			</map>
			  5 |
			Selector: map > area"
		`);
	});

	it("should report error when <area> alt is missing value", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<map>
				<area href="target" alt />
			</map>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "alt" attribute must be set and non-empty when the "href" attribute is present (area-alt) at inline:3:25:
			  1 |
			  2 | 			<map>
			> 3 | 				<area href="target" alt />
			    | 				                    ^^^
			  4 | 			</map>
			  5 |
			Selector: map > area"
		`);
	});

	it("should report error when <area> has empty alt", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<map>
				<area href="target" alt="" />
			</map>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "alt" attribute must be set and non-empty when the "href" attribute is present (area-alt) at inline:3:25:
			  1 |
			  2 | 			<map>
			> 3 | 				<area href="target" alt="" />
			    | 				                    ^^^
			  4 | 			</map>
			  5 |
			Selector: map > area"
		`);
	});

	it("should report error when <area> has alt but no href", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<map>
				<area alt="lorem ipsum" />
			</map>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "alt" attribute cannot be used unless the "href" attribute is present (area-alt) at inline:3:11:
			  1 |
			  2 | 			<map>
			> 3 | 				<area alt="lorem ipsum" />
			    | 				      ^^^
			  4 | 			</map>
			  5 |
			Selector: map > area"
		`);
	});

	it("should report error when <area> with all siblings with same target has empty alt", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<map>
				<area href="foo" alt="" />
				<area href="foo" alt="" />
				<area href="bar" alt="lorem ipsum" />
			</map>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: "alt" attribute must be set and non-empty when the "href" attribute is present (area-alt) at inline:3:22:
			  1 |
			  2 | 			<map>
			> 3 | 				<area href="foo" alt="" />
			    | 				                 ^^^
			  4 | 				<area href="foo" alt="" />
			  5 | 				<area href="bar" alt="lorem ipsum" />
			  6 | 			</map>
			Selector: map > area:nth-child(1)
			error: "alt" attribute must be set and non-empty when the "href" attribute is present (area-alt) at inline:4:22:
			  2 | 			<map>
			  3 | 				<area href="foo" alt="" />
			> 4 | 				<area href="foo" alt="" />
			    | 				                 ^^^
			  5 | 				<area href="bar" alt="lorem ipsum" />
			  6 | 			</map>
			  7 |
			Selector: map > area:nth-child(2)"
		`);
	});

	describe("accessible", () => {
		beforeEach(() => {
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "area-alt": ["error", { accessible: true }] },
			});
		});

		it("should report error even if referencing the same href", async () => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<map>
					<area href="foo" alt="" />
					<area href="foo" alt="lorem ipsum" />
				</map>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toMatchInlineCodeframe(`
				"error: "alt" attribute must be set and non-empty when the "href" attribute is present (area-alt) at inline:3:23:
				  1 |
				  2 | 				<map>
				> 3 | 					<area href="foo" alt="" />
				    | 					                 ^^^
				  4 | 					<area href="foo" alt="lorem ipsum" />
				  5 | 				</map>
				  6 |
				Selector: map > area:nth-child(1)"
			`);
		});
	});

	describe("should contain documentation", () => {
		it.each(Object.values(RuleContext))("%s", async (context) => {
			expect.assertions(1);
			htmlvalidate = new HtmlValidate({
				root: true,
				rules: { "area-alt": "error" },
			});
			const docs = await htmlvalidate.getContextualDocumentation({ ruleId: "area-alt", context });
			expect(docs).toMatchSnapshot();
		});
	});
});
