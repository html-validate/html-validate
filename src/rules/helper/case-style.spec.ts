import { CaseStyle } from "./case-style";

it.each`
	style           | text
	${"lowercase"}  | ${"foo"}
	${"uppercase"}  | ${"FOO"}
	${"camelcase"}  | ${"foo"}
	${"camelcase"}  | ${"fooBar"}
	${"pascalcase"} | ${"Foo"}
	${"pascalcase"} | ${"FooBar"}
`('style "$style" should match "$text"', ({ style, text }) => {
	expect.assertions(1);
	const cs = new CaseStyle(style, "test-case");
	expect(cs.match(text)).toBeTruthy();
});

it.each`
	style           | text
	${"lowercase"}  | ${"FOO"}
	${"uppercase"}  | ${"foo"}
	${"camelcase"}  | ${"Foo"}
	${"camelcase"}  | ${"FooBar"}
	${"pascalcase"} | ${"foo"}
	${"pascalcase"} | ${"fooBar"}
`('style "$style" should not match "$text"', ({ style, text }) => {
	expect.assertions(1);
	const cs = new CaseStyle(style, "test-case");
	expect(cs.match(text)).toBeFalsy();
});

it("should throw exception for unknown styles", () => {
	expect.assertions(1);
	expect(() => {
		return new CaseStyle("unknown-style", "test-case");
	}).toThrow('Invalid style "unknown-style" for "test-case" rule');
});
