import { quote } from "./quote";

it("should wrap value in double quotes by default", () => {
	expect.assertions(1);
	expect(quote("foo")).toBe('"foo"');
});

it("should handle empty string", () => {
	expect.assertions(1);
	expect(quote("")).toBe('""');
});

it("should handle values with spaces", () => {
	expect.assertions(1);
	expect(quote("foo bar")).toBe('"foo bar"');
});

it("should use custom quote character", () => {
	expect.assertions(1);
	expect(quote("foo", "`")).toBe("`foo`");
});

it("should use single quotes when specified", () => {
	expect.assertions(1);
	expect(quote("foo", "'")).toBe("'foo'");
});
