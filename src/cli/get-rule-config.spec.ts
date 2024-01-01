import { Severity } from "../config";
import { getRuleConfig } from "./get-rule-config";

it("should parse rule:severity pair", () => {
	expect.assertions(1);
	expect(getRuleConfig("foo:error")).toEqual({
		foo: Severity.ERROR,
	});
});

it("should parse array of pairs", () => {
	expect.assertions(1);
	expect(getRuleConfig(["foo:error", "bar:warn"])).toEqual({
		foo: Severity.ERROR,
		bar: Severity.WARN,
	});
});

it("should handle leading and trailing whitespace", () => {
	expect.assertions(1);
	expect(getRuleConfig(" foo:error ")).toEqual({
		foo: Severity.ERROR,
	});
});

it("should default to error if severity is missing", () => {
	expect.assertions(1);
	expect(getRuleConfig("foo")).toEqual({
		foo: Severity.ERROR,
	});
});

it("should ignore extraneous text", () => {
	expect.assertions(1);
	expect(getRuleConfig("foo:off:bar")).toEqual({
		foo: Severity.DISABLED,
	});
});
