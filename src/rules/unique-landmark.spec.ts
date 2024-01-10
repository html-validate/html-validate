import { HtmlValidate } from "../htmlvalidate";
import { processAttribute } from "../transform/mocks/attribute";
import "../jest";

describe("rule unique-landmark", () => {
	let htmlvalidate: HtmlValidate;

	beforeAll(() => {
		htmlvalidate = new HtmlValidate({
			root: true,
			rules: { "unique-landmark": "error" },
		});
	});

	it("should not report error when no landmarks are present", async () => {
		expect.assertions(1);
		const markup = /* HTML */ ` <div></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when landmarks (native elements) are present only once", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<aside></aside>
			<footer></footer>
			<form></form>
			<header></header>
			<main></main>
			<nav></nav>
			<section></section>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when landmarks (role) are present only once", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<div role="complementary"></div>
			<div role="contentinfo"></div>
			<div role="form"></div>
			<div role="banner"></div>
			<div role="main"></div>
			<div role="navigation"></div>
			<div role="region"></div>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when landmarks have unique names", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<nav aria-label="primary"></nav>
			<nav aria-label="secondary"></nav>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when landmarks explicitly change role", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<nav role="presentation"></nav>
			<nav role="presentation"></nav>
			<nav></nav>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should not report error when <header> or <footer> is nested in <main> or sectioning content", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<header>primary header</header>
			<main>
				<header></header>
				<footer></footer>
			</main>
			<article>
				<header></header>
				<footer></footer>
			</article>
			<aside>
				<header></header>
				<footer></footer>
			</aside>
			<nav>
				<header></header>
				<footer></footer>
			</nav>
			<section>
				<header></header>
				<footer></footer>
			</section>
			<footer>primary header</footer>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeValid();
	});

	it("should report error when landmark is missing name", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<nav></nav>
			<nav></nav>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Landmarks must have a non-empty and unique accessible name (aria-label or aria-labelledby) (unique-landmark) at inline:2:5:
			  1 |
			> 2 | 			<nav></nav>
			    | 			 ^^^
			  3 | 			<nav></nav>
			  4 |
			Selector: nav:nth-child(1)
			error: Landmarks must have a non-empty and unique accessible name (aria-label or aria-labelledby) (unique-landmark) at inline:3:5:
			  1 |
			  2 | 			<nav></nav>
			> 3 | 			<nav></nav>
			    | 			 ^^^
			  4 |
			Selector: nav:nth-child(2)"
		`);
	});

	it("should report error when landmark has empty name", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<nav aria-label="primary"></nav>
			<nav aria-label=""></nav>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Landmarks must have a non-empty and unique accessible name (aria-label or aria-labelledby) (unique-landmark) at inline:3:9:
			  1 |
			  2 | 			<nav aria-label="primary"></nav>
			> 3 | 			<nav aria-label=""></nav>
			    | 			     ^^^^^^^^^^
			  4 |
			Selector: nav:nth-child(2)"
		`);
	});

	it("should report error when landmark references element without text", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<h2 id="primary-heading">Primary</h2>
			<nav aria-labelledby="primary-heading"></nav>
			<h2 id="secondary-heading"></h2>
			<nav aria-labelledby="secondary-heading"></nav>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Landmarks must have a non-empty and unique accessible name (aria-label or aria-labelledby) (unique-landmark) at inline:5:9:
			  3 | 			<nav aria-labelledby="primary-heading"></nav>
			  4 | 			<h2 id="secondary-heading"></h2>
			> 5 | 			<nav aria-labelledby="secondary-heading"></nav>
			    | 			     ^^^^^^^^^^^^^^^
			  6 |
			Selector: nav:nth-child(4)"
		`);
	});

	it("should report error when landmark references same element", async () => {
		expect.assertions(2);
		const markup = /* HTML */ `
			<nav aria-labelledby="missing-reference"></nav>
			<nav aria-labelledby="missing-reference"></nav>
		`;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Landmarks must have a non-empty and unique accessible name (aria-label or aria-labelledby) (unique-landmark) at inline:2:9:
			  1 |
			> 2 | 			<nav aria-labelledby="missing-reference"></nav>
			    | 			     ^^^^^^^^^^^^^^^
			  3 | 			<nav aria-labelledby="missing-reference"></nav>
			  4 |
			Selector: nav:nth-child(1)
			error: Landmarks must have a non-empty and unique accessible name (aria-label or aria-labelledby) (unique-landmark) at inline:3:9:
			  1 |
			  2 | 			<nav aria-labelledby="missing-reference"></nav>
			> 3 | 			<nav aria-labelledby="missing-reference"></nav>
			    | 			     ^^^^^^^^^^^^^^^
			  4 |
			Selector: nav:nth-child(2)"
		`);
	});

	describe("should report error for", () => {
		const tags = ["aside", "footer", "form", "header", "main", "nav", "section"];
		const roles = [
			"complementary",
			"contentinfo",
			"form",
			"banner",
			"main",
			"navigation",
			"region",
		];

		it.each(tags)("%s", async (tag) => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<${tag}></${tag}>
				<${tag}></${tag}>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([
				{
					ruleId: "unique-landmark",
					message:
						"Landmarks must have a non-empty and unique accessible name (aria-label or aria-labelledby)",
				},
				{
					ruleId: "unique-landmark",
					message:
						"Landmarks must have a non-empty and unique accessible name (aria-label or aria-labelledby)",
				},
			]);
		});

		it.each(roles)("%s", async (role) => {
			expect.assertions(2);
			const markup = /* HTML */ `
				<div role="${role}"></div>
				<div role="${role}"></div>
			`;
			const report = await htmlvalidate.validateString(markup);
			expect(report).toBeInvalid();
			expect(report).toHaveErrors([
				{
					ruleId: "unique-landmark",
					message:
						"Landmarks must have a non-empty and unique accessible name (aria-label or aria-labelledby)",
				},
				{
					ruleId: "unique-landmark",
					message:
						"Landmarks must have a non-empty and unique accessible name (aria-label or aria-labelledby)",
				},
			]);
		});
	});

	it("should handle interpolated aria-label", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<nav aria-label="{{ primary }}"></nav>
			<nav aria-label="{{ secondary }}"></nav>
		`;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should handle dynamic aria-label", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<nav dynamic-aria-label="primary"></nav>
			<nav dynamic-aria-label="secondary"></nav>
		`;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should handle interpolated aria-labelledby", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<nav aria-labelledby="{{ primary }}"></nav>
			<nav aria-labelledby="{{ secondary }}"></nav>
		`;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should handle dynamic aria-labelledby", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<nav dynamic-aria-labelledby="primary"></nav>
			<nav dynamic-aria-labelledby="secondary"></nav>
		`;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should handle interpolated text in referenced aria-labelledby", async () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<h2 id="primary">{{ primary }}</h2>
			<nav aria-labelledby="primary"></nav>
			<h2 id="secondary">{{ secondary }}</h2>
			<nav aria-labelledby="secondary"></nav>
		`;
		const report = await htmlvalidate.validateString(markup, {
			processAttribute,
		});
		expect(report).toBeValid();
	});

	it("should contain documentation", async () => {
		expect.assertions(2);
		const docs = await htmlvalidate.getContextualDocumentation({
			ruleId: "unique-landmark",
		});
		expect(docs?.description).toMatchInlineSnapshot(`
			"When the same type of landmark is present more than once in the same document each must be uniquely identifiable with a non-empty and unique name.
			For instance, if the document has two \`<nav>\` elements each of them need an accessible name to be distinguished from each other.

			The following elements / roles are considered landmarks:

			  - \`aside\` or \`[role="complementary"]\`
			  - \`footer\` or \`[role="contentinfo"]\`
			  - \`form\` or \`[role="form"]\`
			  - \`header\` or \`[role="banner"]\`
			  - \`main\` or \`[role="main"]\`
			  - \`nav\` or \`[role="navigation"]\`
			  - \`section\` or \`[role="region"]\`

			To fix this either:

			  - Add \`aria-label\`.
			  - Add \`aria-labelledby\`.
			  - Remove one of the landmarks."
		`);
		expect(docs?.url).toMatchInlineSnapshot(
			`"https://html-validate.org/rules/unique-landmark.html"`,
		);
	});
});
