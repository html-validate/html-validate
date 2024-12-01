import { Config } from "../config";
import { Parser } from "../parser";
import { dumpTree } from "./dump-tree";

let parser: Parser;

expect.addSnapshotSerializer({
	serialize(value) {
		return String(value);
	},
	test() {
		return true;
	},
});

beforeAll(async () => {
	const config = await Config.empty().resolve();
	parser = new Parser(config);
});

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
			(root)
			└── main
			    ├── p
			    └── p

		`);
	});

	it("should handle deeper nesting", () => {
		expect.assertions(1);
		const markup = /* HTML */ `
			<main>
				<div>
					<p>lorem <strong>ipsum</strong></p>
					<p>dolor <em>sit</em> amet</p>
				</div>
				<div>
					<p>lorem <strong>ipsum</strong></p>
					<p>dolor <em>sit</em> amet</p>
				</div>
			</main>
		`;
		const root = parser.parseHtml(markup);
		const output = dumpTree(root)
			.map((it) => `${it}\n`)
			.join("");
		expect(output).toMatchInlineSnapshot(`
			(root)
			└── main
			    ├── div
			    │   ├── p
			    │   │   └── strong
			    │   └── p
			    │       └── em
			    └── div
			        ├── p
			        │   └── strong
			        └── p
			            └── em

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
		const output = dumpTree(root).join("\n");
		expect(output).toMatchInlineSnapshot(`
			(root)
			└── body
			    ├── p#foo
			    ├── p.bar.baz
			    └── p#fred.flintstone
		`);
	});
});
