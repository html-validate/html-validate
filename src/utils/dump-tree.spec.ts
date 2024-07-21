import { Config } from "../config";
import { Parser } from "../parser";
import { dumpTree } from "./dump-tree";

const parser = new Parser(Config.empty().resolve());

describe("dumpTree()", () => {
	it("should dump DOM tree", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<main>
				<p>lorem ipsum</p>
				<p>dolor sit amet</p>
			</main>
		`;
		const root = parser.parseHtml(markup);
		const output = dumpTree(root)
			.map((it) => `${it}\n`)
			.join("");
		expect(output).toMatchInlineSnapshot(`
			"(root)
			└─┬ main
			  ├── p
			  └── p
			"
		`);
	});

	it("should decorate with id and classes", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<body>
				<p id="foo">lorem ipsum</p>
				<p class="bar baz">dolor sit amet</p>
				<p id="fred" class="flintstone"></p>
			</body>
		`;
		const root = parser.parseHtml(markup);
		const output = dumpTree(root)
			.map((it) => `${it}\n`)
			.join("");
		expect(output).toMatchInlineSnapshot(`
			"(root)
			└─┬ body
			  ├── p#foo
			  ├── p.bar.baz
			  └── p#fred.flintstone
			"
		`);
	});
});
