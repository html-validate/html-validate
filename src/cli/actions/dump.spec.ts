import path from "node:path";
import { WritableStreamBuffer } from "stream-buffers";
import { HtmlValidate } from "../..";
import { Mode } from "../mode";
import { dump } from "./dump";

const rootDir = path.resolve(__dirname, "../../..");
const simple = path.join(rootDir, "test-files/parser/simple.html");
const multiline = path.join(rootDir, "test-files/parser/multiline.html");

let htmlvalidate: HtmlValidate;
let stdout: WritableStreamBuffer;

function filterFilename(content: string): string {
	/* replace all instances of ${root} with "<rootDir>" */
	return content.split(rootDir).join("<rootDir>");
}

beforeEach(() => {
	htmlvalidate = new HtmlValidate();
	stdout = new WritableStreamBuffer();
});

it("should dump events for given filename", async () => {
	expect.assertions(2);
	const success = await dump(htmlvalidate, stdout, [simple], Mode.DUMP_EVENTS);
	const content = stdout.getContentsAsString("utf-8") || "";
	expect(success).toBeTruthy();
	expect(filterFilename(content)).toMatchSnapshot();
});

it("should dump tokens for given filename", async () => {
	expect.assertions(2);
	const success = await dump(htmlvalidate, stdout, [simple], Mode.DUMP_TOKENS);
	const content = stdout.getContentsAsString("utf-8") || "";
	expect(success).toBeTruthy();
	expect(filterFilename(content)).toMatchInlineSnapshot(`
		"TOKEN: TAG_OPEN
		  Data: "<p"
		  Location: <rootDir>/test-files/parser/simple.html:1:1
		TOKEN: WHITESPACE
		  Data: " "
		  Location: <rootDir>/test-files/parser/simple.html:1:3
		TOKEN: ATTR_NAME
		  Data: "id"
		  Location: <rootDir>/test-files/parser/simple.html:1:4
		TOKEN: ATTR_VALUE
		  Data: "=\\"foo\\""
		  Location: <rootDir>/test-files/parser/simple.html:1:6
		TOKEN: TAG_CLOSE
		  Data: ">"
		  Location: <rootDir>/test-files/parser/simple.html:1:12
		TOKEN: TEXT
		  Data: "Lorem ipsum"
		  Location: <rootDir>/test-files/parser/simple.html:1:13
		TOKEN: TAG_OPEN
		  Data: "</p"
		  Location: <rootDir>/test-files/parser/simple.html:1:24
		TOKEN: TAG_CLOSE
		  Data: ">"
		  Location: <rootDir>/test-files/parser/simple.html:1:27
		TOKEN: WHITESPACE
		  Data: "\\n"
		  Location: <rootDir>/test-files/parser/simple.html:1:28
		TOKEN: EOF
		  Data: ""
		  Location: <rootDir>/test-files/parser/simple.html:2:1
		"
	`);
});

it("should dump tree for given filename", async () => {
	expect.assertions(2);
	const success = await dump(htmlvalidate, stdout, [simple], Mode.DUMP_TREE);
	const content = stdout.getContentsAsString("utf-8") || "";
	expect(success).toBeTruthy();
	expect(filterFilename(content)).toMatchInlineSnapshot(`
		"(root)
		└── p#foo
		"
	`);
});

it("should dump source for given filename", async () => {
	expect.assertions(2);
	const success = await dump(htmlvalidate, stdout, [simple], Mode.DUMP_SOURCE);
	const content = stdout.getContentsAsString("utf-8") || "";
	expect(success).toBeTruthy();
	expect(filterFilename(content)).toMatchInlineSnapshot(`
		"Source <rootDir>/test-files/parser/simple.html@1:1 (offset: 0)
		---
		<p id="foo">Lorem ipsum</p>

		---
		"
	`);
});

it("should handle multiple files", async () => {
	expect.assertions(2);
	const success = await dump(htmlvalidate, stdout, [simple, multiline], Mode.DUMP_TREE);
	const content = stdout.getContentsAsString("utf-8") || "";
	expect(success).toBeTruthy();
	expect(filterFilename(content)).toMatchInlineSnapshot(`
		"(root)
		└── p#foo
		(root)
		└── p
		"
	`);
});

it("should throw exception on unknown mode", async () => {
	expect.assertions(1);
	await expect(() => dump(htmlvalidate, stdout, [simple], -1 as unknown as Mode)).toThrow(
		`Unknown mode "-1"`,
	);
});
