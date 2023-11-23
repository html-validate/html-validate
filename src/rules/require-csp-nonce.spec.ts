import { HtmlValidate } from "../htmlvalidate";
import "../jest";

describe("rule require-csp-nonce", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			rules: { "require-csp-nonce": ["error", { tags: ["script", "style"] }] },
		});
	});

	it("should report error when nonce attribute is missing from <script>", () => {
		expect.assertions(2);
		const markup = /* HTML */ `<script></script>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: required CSP nonce is missing (require-csp-nonce) at inline:1:2:
			> 1 | <script></script>
			    |  ^^^^^^
			Selector: script"
		`);
	});

	it("should report error when nonce attribute is missing from <style>", () => {
		expect.assertions(2);
		const markup = /* HTML */ `<style></style>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: required CSP nonce is missing (require-csp-nonce) at inline:1:2:
			> 1 | <style></style>
			    |  ^^^^^
			Selector: style"
		`);
	});

	it("should not report error on <script> with src attribute", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<script src=".."></script>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error on <script> with nonce attribute", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<script nonce=".."></script>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error on <style> with nonce attribute", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<style nonce=".."></style>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error on other elements", () => {
		expect.assertions(1);
		const markup = /* HTML */ `<div></div>`;
		const report = htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should contain documentation", async () => {
		expect.assertions(2);
		htmlvalidate = new HtmlValidate({
			rules: { "require-csp-nonce": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("require-csp-nonce");
		expect(docs?.url).toMatchInlineSnapshot(
			`"https://html-validate.org/rules/require-csp-nonce.html"`,
		);
		expect(docs?.description).toMatchInlineSnapshot(`
			"Required Content-Security-Policy (CSP) nonce is missing or empty.

			This is set by the \`nonce\` attribute and must match the \`Content-Security-Policy\` header.
			For instance, if the header contains \`script-src 'nonce-r4nd0m'\` the \`nonce\` attribute must be set to \`nonce="r4nd0m">\`

			The nonce should be unique per each request and set to a cryptography secure random token.
			It is used to prevent cross site scripting (XSS) by preventing malicious actors from injecting scripts onto the page."
		`);
	});
});
