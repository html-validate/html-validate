import { heading } from "./heading";

it("should automatically generate id", () => {
	expect.assertions(1);
	const text = "my heading";
	const markup = heading(text, 1, text, {});
	expect(markup).toMatchInlineSnapshot(`"<h1 id="my-heading">my heading</h1>"`);
});

it("should handle version numbers", () => {
	expect.assertions(1);
	const text = "1.2.3 (1999-12-31)";
	const markup = heading(text, 1, text, {});
	expect(markup).toMatchInlineSnapshot(`"<h1 id="v1-2-3">1.2.3 (1999-12-31)</h1>"`);
});

it("should handle explicit id", () => {
	expect.assertions(1);
	const text = "foo bar {#explicit-id}";
	const markup = heading(text, 1, text, {});
	expect(markup).toMatchInlineSnapshot(`"<h1 id="explicit-id">foo bar</h1>"`);
});

it("should add anchor links", () => {
	expect.assertions(1);
	const text = "my heading";
	const markup = heading(text, 2, text, {});
	expect(markup).toMatchInlineSnapshot(
		`"<h2 id="my-heading">my heading<a class="anchorlink" href="#my-heading" aria-hidden="true"></a></h2>"`,
	);
});
