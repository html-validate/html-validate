import { interpolate } from "./interpolate";

it("should interpolate placeholder", () => {
	expect.assertions(1);
	const message = "foo {{ value }} baz";
	const data = { value: "bar" };
	expect(interpolate(message, data)).toBe("foo bar baz");
});

it("should interpolate multiple placeholders", () => {
	expect.assertions(1);
	const message = "{{ a }} {{ b }} {{ c }}";
	const data = { a: "foo", b: "bar", c: "baz" };
	expect(interpolate(message, data)).toBe("foo bar baz");
});

it("should interpolate number", () => {
	expect.assertions(1);
	const message = "value: {{ value }}";
	const data = { value: 12 };
	expect(interpolate(message, data)).toBe("value: 12");
});

it("should interpolate array", () => {
	expect.assertions(1);
	const message = "value: {{ value }}";
	const data = { value: [1, 2, 3] };
	expect(interpolate(message, data)).toBe("value: [ 1, 2, 3 ]");
});

it("should interpolate object", () => {
	expect.assertions(1);
	const message = "value: {{ value }}";
	const data = { value: { a: "foo", b: "bar" } };
	expect(interpolate(message, data)).toBe("value: { a: 'foo', b: 'bar' }");
});

it("should return original placeholder when value is missing", () => {
	expect.assertions(1);
	const message = "foo {{ value }} baz";
	const data = {};
	expect(interpolate(message, data)).toBe("foo {{ value }} baz");
});

it("should handle missing whitespace", () => {
	expect.assertions(1);
	const message = "foo {{value}} baz";
	const data = { value: "bar" };
	expect(interpolate(message, data)).toBe("foo bar baz");
});

it("should handle newlines", () => {
	expect.assertions(1);
	const message = "foo {{\n\tvalue\n}} baz";
	const data = { value: "bar" };
	expect(interpolate(message, data)).toBe("foo bar baz");
});

it("should handle falsey values", () => {
	expect.assertions(1);
	const message = '"{{ empty }}" {{ zero }} {{ false }} {{ null }}';
	const data = { empty: "", zero: 0, false: false, null: null };
	expect(interpolate(message, data)).toBe('"" 0 false null');
});
