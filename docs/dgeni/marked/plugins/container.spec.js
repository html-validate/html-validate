import { marked } from "marked";
import { plugin } from "./container";

marked.use(plugin());

expect.addSnapshotSerializer({
	serialize(value) {
		return value.trim();
	},
	test() {
		return true;
	},
});

it("should render container with explicit variant", () => {
	expect.assertions(1);
	const markdown = [
		":::foo",
		"lorem ipsum dolor sit amet",
		":::",
		"::: bar",
		"lorem ipsum dolor sit amet",
		":::",
	].join("\n");
	const markup = marked(markdown);
	expect(markup).toMatchInlineSnapshot(`
		<div class="docs-container docs-container--foo">
			<p class="docs-container__title"><span class="docs-container__icon" aria-hidden="true"></span>FOO</p>
			<div class="docs-container__content"><p>lorem ipsum dolor sit amet</p></div>
		</div>
		<div class="docs-container docs-container--bar">
			<p class="docs-container__title"><span class="docs-container__icon" aria-hidden="true"></span>BAR</p>
			<div class="docs-container__content"><p>lorem ipsum dolor sit amet</p></div>
		</div>
	`);
});

it("should render container with explicit title", () => {
	expect.assertions(1);
	const markdown = [
		":::foo foo title",
		"lorem ipsum dolor sit amet",
		":::",
		"::: bar bar title",
		"lorem ipsum dolor sit amet",
		":::",
	].join("\n");
	const markup = marked(markdown);
	expect(markup).toMatchInlineSnapshot(`
		<div class="docs-container docs-container--foo">
			<p class="docs-container__title"><span class="docs-container__icon" aria-hidden="true"></span>foo title</p>
			<div class="docs-container__content"><p>lorem ipsum dolor sit amet</p></div>
		</div>
		<div class="docs-container docs-container--bar">
			<p class="docs-container__title"><span class="docs-container__icon" aria-hidden="true"></span>bar title</p>
			<div class="docs-container__content"><p>lorem ipsum dolor sit amet</p></div>
		</div>
	`);
});

it("should render nested markdown", () => {
	expect.assertions(1);
	const markdown = ["::: foo foo `code` bar", "lorem **ipsum** dolor sit amet", ":::"].join("\n");
	const markup = marked(markdown);
	expect(markup).toMatchInlineSnapshot(`
		<div class="docs-container docs-container--foo">
			<p class="docs-container__title"><span class="docs-container__icon" aria-hidden="true"></span>foo <code>code</code> bar</p>
			<div class="docs-container__content"><p>lorem <strong>ipsum</strong> dolor sit amet</p></div>
		</div>
	`);
});

it("should throw error when infostring is empty", () => {
	expect.assertions(1);
	const markdown = [":::", "lorem ipsum dolor sit amet", ":::"].join("\n");
	expect(() => marked(markdown)).toThrow("Markdown container missing variant tag");
});
