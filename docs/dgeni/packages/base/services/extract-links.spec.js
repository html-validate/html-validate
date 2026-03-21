import extractLinksService from "./extract-links";

const extractLinks = extractLinksService();

it("should return empty arrays for empty html", () => {
	expect.assertions(1);
	const result = extractLinks("");
	expect(result).toEqual({ hrefs: [], names: [] });
});

it("should extract href from anchor element", () => {
	expect.assertions(1);
	const result = extractLinks(`<a href="/foo/bar">link</a>`);
	expect(result).toEqual({ hrefs: ["/foo/bar"], names: [] });
});

it("should extract name from anchor element", () => {
	expect.assertions(1);
	const result = extractLinks(`<a name="section">link</a>`);
	expect(result).toEqual({ hrefs: [], names: ["section"] });
});

it("should extract both href and name from a single anchor element", () => {
	expect.assertions(1);
	const result = extractLinks(`<a href="#section" name="section">link</a>`);
	expect(result).toEqual({ hrefs: ["#section"], names: ["section"] });
});

it("should extract id from non-anchor elements", () => {
	expect.assertions(1);
	const result = extractLinks(`<h2 id="my-heading">Heading</h2>`);
	expect(result).toEqual({ hrefs: [], names: ["my-heading"] });
});

it("should extract id from anchor elements", () => {
	expect.assertions(1);
	const result = extractLinks(`<a id="anchor-id">link</a>`);
	expect(result).toEqual({ hrefs: [], names: ["anchor-id"] });
});

it("should extract from multiple elements", () => {
	expect.assertions(1);
	const html = [
		`<a href="/page-one">one</a>`,
		`<a href="/page-two" name="ref-two">two</a>`,
		`<h2 id="section-a">Section A</h2>`,
	].join("\n");
	const result = extractLinks(html);
	expect(result).toEqual({
		hrefs: ["/page-one", "/page-two"],
		names: ["ref-two", "section-a"],
	});
});

it("should decode html entities in attribute values", () => {
	expect.assertions(1);
	const result = extractLinks(`<a href="/search?q=foo&amp;bar=baz">link</a>`);
	expect(result).toEqual({ hrefs: ["/search?q=foo&bar=baz"], names: [] });
});
