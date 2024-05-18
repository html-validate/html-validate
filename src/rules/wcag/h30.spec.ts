import { HtmlValidate } from "../../htmlvalidate";
import "../../jest";

describe("wcag/h30", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "wcag/h30": "error" },
		});
	});

	it("should not report when <a> is missing href", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a></a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when link has text", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a href>lorem ipsum</a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when link has image with alt-text", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a href><img alt="lorem ipsum" /></a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when link has svg with <title>", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<a href>
				<svg><title>lorem ipsum</title></svg>
			</a>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when link has svg with <desc>", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<a href>
				<svg><desc>lorem ipsum</desc></svg>
			</a>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when link has aria-label", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a href aria-label="lorem ipsum"></a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when descendant has aria-label", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a href><span aria-label="lorem ipsum"></span></a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report when link is hidden from accessibility tree", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `<a href aria-hidden="true"></a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when hidden link has text", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<a href hidden>lorem ipsum</a>
			<div hidden>
				<a href>dolor sit amet</a>
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when link is missing text", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a href></a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Anchor link must have a text describing its purpose (wcag/h30) at inline:1:2:
			> 1 | <a href></a>
			    |  ^
			Selector: a"
		`);
	});

	it("should report error when link is missing text and image alt", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a href><img /></a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Anchor link must have a text describing its purpose (wcag/h30) at inline:1:2:
			> 1 | <a href><img /></a>
			    |  ^
			Selector: a"
		`);
	});

	it("should report error when link is missing text and image has empty alt", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `<a href><img alt="" /></a>`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Anchor link must have a text describing its purpose (wcag/h30) at inline:1:2:
			> 1 | <a href><img alt="" /></a>
			    |  ^
			Selector: a"
		`);
	});

	it("should not report error when hidden link is missing text", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<a href hidden></a>
			<div hidden>
				<a href></a>
			</div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("smoketest", async () => {
		expect.assertions(1);
		const report = await htmlvalidate.validateFile("test-files/rules/wcag/h30.html");
		expect(report).toMatchInlineCodeframe(`
			"error: Anchor link must have a text describing its purpose (wcag/h30) at test-files/rules/wcag/h30.html:8:2:
			   6 |
			   7 | <!-- invalid cases -->
			>  8 | <a href><img></a>
			     |  ^
			   9 | <a href><img alt></a>
			  10 | <a href><img alt=""></a>
			  11 |
			Selector: a:nth-child(5)
			error: Anchor link must have a text describing its purpose (wcag/h30) at test-files/rules/wcag/h30.html:9:2:
			   7 | <!-- invalid cases -->
			   8 | <a href><img></a>
			>  9 | <a href><img alt></a>
			     |  ^
			  10 | <a href><img alt=""></a>
			  11 |
			Selector: a:nth-child(6)
			error: Anchor link must have a text describing its purpose (wcag/h30) at test-files/rules/wcag/h30.html:10:2:
			   8 | <a href><img></a>
			   9 | <a href><img alt></a>
			> 10 | <a href><img alt=""></a>
			     |  ^
			  11 |
			Selector: a:nth-child(7)"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		htmlvalidate = new HtmlValidate({
			rules: { "wcag/h30": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("wcag/h30");
		expect(docs).toMatchSnapshot();
	});
});
