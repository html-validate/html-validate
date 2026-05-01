import { describe, expect, it } from "@jest/globals";
import { escapeSelectorComponent } from "./escape-selector-component";

describe("escapeSelectorComponent", () => {
	describe("should escape character", () => {
		/* An oracle generated in Chrome 99 from the following code:
		 *
		 * ```js
		 * Array(127-32).fill().map((_, i) => {
		 *     const ch = String.fromCharCode(i + 32);
		 *     const id = `foo${ch}bar`;
		 *     return [ch, CSS.escape(id)];
		 * })
		 * ```
		 */
		const oracle = [
			["\t", "foo\\\u0039 bar"],
			["\n", "foo\\\u0061 bar"],
			["\r", "foo\\\u0064 bar"],
			[" ", "foo\\ bar"],
			["!", "foo\\!bar"],
			['"', 'foo\\"bar'],
			["#", "foo\\#bar"],
			["$", "foo\\$bar"],
			["%", "foo\\%bar"],
			["&", "foo\\&bar"],
			["'", "foo\\'bar"],
			["(", "foo\\(bar"],
			[")", "foo\\)bar"],
			["*", "foo\\*bar"],
			["+", "foo\\+bar"],
			[",", "foo\\,bar"],
			["-", "foo-bar"],
			[".", "foo\\.bar"],
			["/", "foo\\/bar"],
			["0", "foo0bar"],
			["1", "foo1bar"],
			["2", "foo2bar"],
			["3", "foo3bar"],
			["4", "foo4bar"],
			["5", "foo5bar"],
			["6", "foo6bar"],
			["7", "foo7bar"],
			["8", "foo8bar"],
			["9", "foo9bar"],
			[":", "foo\\:bar"],
			[";", "foo\\;bar"],
			["<", "foo\\<bar"],
			["=", "foo\\=bar"],
			[">", "foo\\>bar"],
			["?", "foo\\?bar"],
			["@", "foo\\@bar"],
			["A", "fooAbar"],
			["B", "fooBbar"],
			["C", "fooCbar"],
			["D", "fooDbar"],
			["E", "fooEbar"],
			["F", "fooFbar"],
			["G", "fooGbar"],
			["H", "fooHbar"],
			["I", "fooIbar"],
			["J", "fooJbar"],
			["K", "fooKbar"],
			["L", "fooLbar"],
			["M", "fooMbar"],
			["N", "fooNbar"],
			["O", "fooObar"],
			["P", "fooPbar"],
			["Q", "fooQbar"],
			["R", "fooRbar"],
			["S", "fooSbar"],
			["T", "fooTbar"],
			["U", "fooUbar"],
			["V", "fooVbar"],
			["W", "fooWbar"],
			["X", "fooXbar"],
			["Y", "fooYbar"],
			["Z", "fooZbar"],
			["[", "foo\\[bar"],
			["\\", "foo\\\\bar"],
			["]", "foo\\]bar"],
			["^", "foo\\^bar"],
			["_", "foo_bar"],
			["`", "foo\\`bar"],
			["a", "fooabar"],
			["b", "foobbar"],
			["c", "foocbar"],
			["d", "foodbar"],
			["e", "fooebar"],
			["f", "foofbar"],
			["g", "foogbar"],
			["h", "foohbar"],
			["i", "fooibar"],
			["j", "foojbar"],
			["k", "fookbar"],
			["l", "foolbar"],
			["m", "foombar"],
			["n", "foonbar"],
			["o", "fooobar"],
			["p", "foopbar"],
			["q", "fooqbar"],
			["r", "foorbar"],
			["s", "foosbar"],
			["t", "footbar"],
			["u", "fooubar"],
			["v", "foovbar"],
			["w", "foowbar"],
			["x", "fooxbar"],
			["y", "fooybar"],
			["z", "foozbar"],
			["{", "foo\\{bar"],
			["|", "foo\\|bar"],
			["}", "foo\\}bar"],
			["~", "foo\\~bar"],
		];
		it.each(oracle)('"%s"', (ch, expected) => {
			expect.assertions(1);
			const part = `foo${ch}bar`;
			expect(escapeSelectorComponent(part)).toBe(expected);
		});
	});

	it("should escape all occurrences", () => {
		expect.assertions(1);
		expect(escapeSelectorComponent("foo bar baz")).toBe("foo\\ bar\\ baz");
	});
});
