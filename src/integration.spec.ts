import { globSync } from "glob";
import { HtmlValidate } from "./htmlvalidate";
import { type ConfigData, type Resolver, type RuleConfig, staticResolver } from "./config";
import { FileSystemConfigLoader } from "./config/loaders/file-system";
import { type Source } from "./context";
import { TRANSFORMER_API } from "./transform";
import { type Plugin } from "./plugin";
import "./jest";
import { Rule } from "./rule";
import { type DOMReadyEvent } from "./event";
import { StaticConfigLoader } from "./browser";

expect.addSnapshotSerializer({
	serialize(value: string): string {
		return JSON.stringify(value.replace(process.cwd(), "<rootDir>"));
	},
	test(value: unknown): boolean {
		return typeof value === "string" && value.startsWith(process.cwd());
	},
});

it("should compute correct line, column and offset when using transformed sources", async () => {
	expect.assertions(2);

	/* create a mock rule which reports error on root element */
	class MockRule extends Rule<string> {
		public setup(): void {
			this.on("dom:ready", (event: DOMReadyEvent) => {
				const root = event.document.root;
				this.report(root, "mock error");
			});
		}
	}

	/* create a mock transformer which will create a new source for each line */
	function transformer(source: Source): Source[] {
		const lines = source.data.split("\n");
		return lines.filter(Boolean).map((line: string, index: number): Source => {
			/* all lines have the same length */
			const offset = (line.length + 1) * index;
			return {
				data: line,
				filename: source.filename,
				line: index + 1,
				column: 1,
				offset,
				originalData: source.data,
			};
		});
	}
	transformer.api = TRANSFORMER_API.VERSION;

	/* create a mock plugin to expose mocks */
	const plugin: Plugin = {
		rules: {
			"mock-rule": MockRule,
		},
		transformer,
	};

	const resolvers: Resolver[] = [
		staticResolver({
			plugins: { plugin },
		}),
	];

	const loader = new StaticConfigLoader(resolvers, {
		root: true,
		plugins: ["plugin"],
		transform: {
			".*": "plugin",
		},
		rules: {
			"mock-rule": "error",
		},
	});

	/* create validator instance configured to use mock */
	const htmlvalidate = new HtmlValidate(loader);

	/* ensure line, column and offsets are correct */
	const report = await htmlvalidate.validateString("<p>line 1</p>\n<p>line 2</p>\n<p>line 3</p>\n");
	expect(report).toBeInvalid();
	expect(report.results[0]).toMatchInlineSnapshot(`
		{
		  "errorCount": 3,
		  "filePath": "inline",
		  "messages": [
		    {
		      "column": 1,
		      "line": 1,
		      "message": "mock error",
		      "offset": 0,
		      "ruleId": "mock-rule",
		      "selector": null,
		      "severity": 2,
		      "size": 0,
		    },
		    {
		      "column": 1,
		      "line": 2,
		      "message": "mock error",
		      "offset": 14,
		      "ruleId": "mock-rule",
		      "selector": null,
		      "severity": 2,
		      "size": 0,
		    },
		    {
		      "column": 1,
		      "line": 3,
		      "message": "mock error",
		      "offset": 28,
		      "ruleId": "mock-rule",
		      "selector": null,
		      "severity": 2,
		      "size": 0,
		    },
		  ],
		  "source": "<p>line 1</p>
		<p>line 2</p>
		<p>line 3</p>
		",
		  "warningCount": 0,
		}
	`);
});

it("should handle source missing properties", async () => {
	expect.assertions(2);
	const source = {
		data: "<p>lorem ipsum</i>",
	};
	const htmlvalidate = new HtmlValidate({
		root: true,
		extends: ["html-validate:recommended"],
	});
	const report = await htmlvalidate.validateSource(source as Source);
	expect(report).toBeInvalid();
	expect(report.results[0]).toMatchInlineSnapshot(`
		{
		  "errorCount": 1,
		  "filePath": "",
		  "messages": [
		    {
		      "column": 16,
		      "line": 1,
		      "message": "Mismatched close-tag, expected '</p>' but found '</i>'.",
		      "offset": 15,
		      "ruleId": "close-order",
		      "ruleUrl": "https://html-validate.org/rules/close-order.html",
		      "selector": null,
		      "severity": 2,
		      "size": 2,
		    },
		  ],
		  "source": "<p>lorem ipsum</i>",
		  "warningCount": 0,
		}
	`);
});

it("should report parser-error when last tag is left unopened", async () => {
	expect.assertions(2);
	const htmlvalidate = new HtmlValidate({
		root: true,
	});
	const report = await htmlvalidate.validateString("<div");
	expect(report).toBeInvalid();
	expect(report.results[0]).toMatchInlineSnapshot(`
		{
		  "errorCount": 1,
		  "filePath": "inline",
		  "messages": [
		    {
		      "column": 1,
		      "line": 1,
		      "message": "stream ended before TAG_CLOSE token was found",
		      "offset": 0,
		      "ruleId": "parser-error",
		      "selector": null,
		      "severity": 2,
		      "size": 4,
		    },
		  ],
		  "source": "<div",
		  "warningCount": 0,
		}
	`);
});

it("should allow inline metadata", async () => {
	expect.assertions(1);
	const htmlvalidate = new HtmlValidate({
		elements: [
			{
				foo: {
					attributes: {
						"string-value": {
							enum: ["foo"],
						},
						"string-regexp": {
							enum: ["/foo/"],
						},
						"literal-regexp": {
							enum: [/foo/],
						},
					},
				},
			},
		],
	});
	const markup = /* HTML */ `
		<foo string="foo"></foo>
		<foo string-regexp="foo"></foo>
		<foo literal-regexp="foo"></foo>
	`;
	const report = await htmlvalidate.validateString(markup);
	expect(report).toBeValid();
});

describe("configuration smoketest", () => {
	/* extract only relevant rules from configuration to avoid bloat when new
	 * rules are added to recommended config */
	function filter(src: ConfigData): ConfigData {
		const whitelisted = [
			"no-self-closing",
			"deprecated",
			"element-permitted-content",
			"void-content",
		];
		const data = { rules: {}, ...src };
		data.rules = Object.keys(data.rules)
			.filter((key) => whitelisted.includes(key))
			.reduce<RuleConfig>((dst, key) => {
				dst[key] = data.rules[key];
				return dst;
			}, {});
		return data;
	}

	const files = globSync("test-files/config/**/*.html");
	it.each(files)("%s", async (filename: string) => {
		expect.assertions(2);
		const loader = new FileSystemConfigLoader();
		const htmlvalidate = new HtmlValidate(loader);
		const config = await htmlvalidate.getConfigFor(filename);
		const report = await htmlvalidate.validateFile(filename);
		expect(filter(config.getConfigData())).toMatchSnapshot("config");
		expect(report.results).toMatchSnapshot("results");
	});
});
