import { type CaseStyleName, CaseStyle } from "./case-style";

it.each`
	style           | text
	${"lowercase"}  | ${"foo"}
	${"uppercase"}  | ${"FOO"}
	${"camelcase"}  | ${"foo"}
	${"camelcase"}  | ${"fooBar"}
	${"pascalcase"} | ${"Foo"}
	${"pascalcase"} | ${"FooBar"}
`(
	'style "$style" should match "$text"',
	({ style, text }: { style: CaseStyleName; text: string }) => {
		expect.assertions(1);
		const cs = new CaseStyle(style, "test-case");
		expect(cs.match(text)).toBeTruthy();
	},
);

it.each`
	style           | text
	${"lowercase"}  | ${"FOO"}
	${"uppercase"}  | ${"foo"}
	${"camelcase"}  | ${"Foo"}
	${"camelcase"}  | ${"FooBar"}
	${"pascalcase"} | ${"foo"}
	${"pascalcase"} | ${"fooBar"}
`(
	'style "$style" should not match "$text"',
	({ style, text }: { style: CaseStyleName; text: string }) => {
		expect.assertions(1);
		const cs = new CaseStyle(style, "test-case");
		expect(cs.match(text)).toBeFalsy();
	},
);

it("should handle multiple patterns", () => {
	expect.assertions(3);
	const cs = new CaseStyle(["uppercase", "lowercase"], "test-case");
	expect(cs.match("FOO")).toBeTruthy();
	expect(cs.match("bar")).toBeTruthy();
	expect(cs.match("FooBar")).toBeFalsy();
});

it("should throw exception for unknown styles", () => {
	expect.assertions(1);
	expect(() => {
		return new CaseStyle("unknown-style" as unknown as CaseStyleName, "test-case");
	}).toThrow('Invalid style "unknown-style" for test-case rule');
});

it("should throw exception if no styles are set", () => {
	expect.assertions(1);
	expect(() => {
		return new CaseStyle([], "test-case");
	}).toThrow("Missing style for test-case rule");
});

describe("name", () => {
	it("single name should be presented as-is", () => {
		expect.assertions(1);
		const cs = new CaseStyle("uppercase", "test-case");
		expect(cs.name).toBe("uppercase");
	});

	it('two names should be joined by "or"', () => {
		expect.assertions(1);
		const cs = new CaseStyle(["uppercase", "lowercase"], "test-case");
		expect(cs.name).toBe("uppercase or lowercase");
	});

	it("more than two names should be joined by comma followed by or", () => {
		expect.assertions(1);
		const cs = new CaseStyle(["lowercase", "pascalcase", "camelcase"], "test-case");
		expect(cs.name).toBe("lowercase, PascalCase or camelCase");
	});
});
