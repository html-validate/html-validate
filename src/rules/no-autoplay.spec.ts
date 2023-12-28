import { HtmlValidate } from "../htmlvalidate";
import "../jest";
import { processAttribute } from "../transform/mocks/attribute";

describe("rule no-autoplay", () => {
	describe("default config", () => {
		let htmlvalidate: HtmlValidate;

		beforeAll(() => {
			htmlvalidate = new HtmlValidate({
				rules: { "no-autoplay": "error" },
			});
		});

		it.each(["audio", "video"])(
			"should not report error when <%s> does not have autoplay",
			async (tagName) => {
				expect.assertions(1);
				const markup = /* HTML */ ` <${tagName}></${tagName}> `;
				const report = await htmlvalidate.validateString(markup);
				expect(report).toBeValid();
			},
		);

		it("should not report error when autoplay attribute is dynamic", async () => {
			expect.assertions(1);
			const markup = /* HTML */ ` <video dynamic-autoplay="enableAutoplay"></video> `;
			const report = await htmlvalidate.validateString(markup, {
				processAttribute,
			});
			expect(report).toBeValid();
		});

		it.each(["audio", "video"])("should report error when <%s> have autoplay", async (tagName) => {
			expect.assertions(1);
			const markup = /* HTML */ ` <${tagName} autoplay></${tagName}> `;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
		});
	});

	it("should not report error when role is excluded", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			rules: { "no-autoplay": ["error", { exclude: ["video"] }] },
		});
		const valid = await htmlvalidate.validateString("<video autoplay></video>");
		const invalid = await htmlvalidate.validateString("<audio autoplay></audio>");
		expect(valid).toBeValid();
		expect(invalid).toBeInvalid();
	});

	it("should report error only for included roles", async () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			rules: { "no-autoplay": ["error", { include: ["video"] }] },
		});
		const valid = await htmlvalidate.validateString("<audio autoplay></audio>");
		const invalid = await htmlvalidate.validateString("<video autoplay></video>");
		expect(valid).toBeValid();
		expect(invalid).toBeInvalid();
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "no-autoplay": "error" },
		});
		const context = {
			tagName: "video",
		};
		const docs = await htmlvalidate.getRuleDocumentation("no-autoplay", null, context);
		expect(docs).toMatchSnapshot();
	});
});
