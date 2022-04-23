import { DynamicValue } from "../dynamic-value";
import { parseCssDeclaration } from "./parse-css-declaration";

it("should parse declaration", () => {
	expect.assertions(1);
	const decl = parseCssDeclaration("color: red");
	expect(decl).toEqual({
		color: "red",
	});
});

it("should parse multiple declarations", () => {
	expect.assertions(1);
	const decl = parseCssDeclaration("color: red; background: blue");
	expect(decl).toEqual({
		color: "red",
		background: "blue",
	});
});

it("should handle trailing semicolon", () => {
	expect.assertions(1);
	const decl = parseCssDeclaration("color: red;");
	expect(decl).toEqual({
		color: "red",
	});
});

it("should handle missing whitespace", () => {
	expect.assertions(1);
	const decl = parseCssDeclaration("color:red;background:blue");
	expect(decl).toEqual({
		color: "red",
		background: "blue",
	});
});

it("should handle excessive whitespace", () => {
	expect.assertions(1);
	const decl = parseCssDeclaration("  color:\tred;\n  background:\tblue");
	expect(decl).toEqual({
		color: "red",
		background: "blue",
	});
});

it("should handle missing value", () => {
	expect.assertions(1);
	const decl = parseCssDeclaration("color; background");
	expect(decl).toEqual({
		color: "",
		background: "",
	});
});

it("should handle empty string", () => {
	expect.assertions(1);
	const decl = parseCssDeclaration("");
	expect(decl).toEqual({});
});

it("should handle null string", () => {
	expect.assertions(1);
	const decl = parseCssDeclaration(null);
	expect(decl).toEqual({});
});

it("should handle dynamic value", () => {
	expect.assertions(1);
	const decl = parseCssDeclaration(new DynamicValue("expr"));
	expect(decl).toEqual({});
});
