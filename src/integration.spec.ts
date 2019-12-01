import HtmlValidate from "./htmlvalidate";
import { Source } from "./context";
import { TRANSFORMER_API } from "./transform";
import { Plugin } from "./plugin";
import "./matchers";
import { Rule } from "./rule";
import { DOMReadyEvent } from "./event";

it("should compute correct line, column and offset when using transformed sources", () => {
	expect.assertions(2);

	/* create a mock rule which reports error on root element */
	class MockRule extends Rule {
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
		return lines.filter(Boolean).map(
			(line: string, index: number): Source => {
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
			}
		);
	}
	transformer.api = TRANSFORMER_API.VERSION;

	/* create a mock plugin to expose mocks */
	const plugin: Plugin = {
		rules: {
			"mock-rule": MockRule,
		},
		transformer,
	};
	jest.mock("plugin", () => plugin, { virtual: true });

	/* create validator instance configured to use mock */
	const htmlvalidate = new HtmlValidate({
		root: true,
		plugins: ["plugin"],
		transform: {
			".*": "plugin",
		},
		rules: {
			"mock-rule": "error",
		},
	});

	/* ensure line, column and offsets are correct */
	const report = htmlvalidate.validateString(
		"<p>line 1</p>\n<p>line 2</p>\n<p>line 3</p>\n"
	);
	expect(report).toBeInvalid();
	expect(report.results[0]).toMatchInlineSnapshot(`
		Object {
		  "errorCount": 3,
		  "filePath": "inline",
		  "messages": Array [
		    Object {
		      "column": 1,
		      "context": undefined,
		      "line": 1,
		      "message": "mock error",
		      "offset": 0,
		      "ruleId": "mock-rule",
		      "severity": 2,
		      "size": 0,
		    },
		    Object {
		      "column": 1,
		      "context": undefined,
		      "line": 2,
		      "message": "mock error",
		      "offset": 14,
		      "ruleId": "mock-rule",
		      "severity": 2,
		      "size": 0,
		    },
		    Object {
		      "column": 1,
		      "context": undefined,
		      "line": 3,
		      "message": "mock error",
		      "offset": 28,
		      "ruleId": "mock-rule",
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
