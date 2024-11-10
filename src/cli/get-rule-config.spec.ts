import { getRuleConfig } from "./get-rule-config";

it("should parse rule:severity pair", () => {
	expect.assertions(1);
	expect(getRuleConfig("foo:error")).toEqual({
		foo: "error",
	});
});

it("should parse array of pairs", () => {
	expect.assertions(1);
	expect(getRuleConfig(["foo:error", "bar:warn"])).toEqual({
		foo: "error",
		bar: "warn",
	});
});

it("should handle leading and trailing whitespace", () => {
	expect.assertions(1);
	expect(getRuleConfig(" foo:error ")).toEqual({
		foo: "error",
	});
});

it("should default to error if severity is missing", () => {
	expect.assertions(1);
	expect(getRuleConfig("foo")).toEqual({
		foo: "error",
	});
});

it("should ignore extraneous text", () => {
	expect.assertions(1);
	expect(getRuleConfig("foo:off:bar")).toEqual({
		foo: "off",
	});
});
