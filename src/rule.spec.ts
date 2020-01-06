import path from "path";
import { Config, Severity } from "./config";
import { Location } from "./context";
import { HtmlElement } from "./dom";
import { Event } from "./event";
import { Parser } from "./parser";
import { Reporter } from "./reporter";
import { Rule, ruleDocumentationUrl } from "./rule";
import { MetaTable } from "./meta";

class MockRule extends Rule {
	public setup(): void {
		/* do nothing */
	}
}

describe("rule base class", () => {
	let parser: Parser;
	let reporter: Reporter;
	let meta: MetaTable;
	let rule: Rule;
	let mockLocation: Location;
	let mockEvent: Event;

	beforeEach(() => {
		parser = new Parser(Config.empty());
		parser.on = jest.fn();
		reporter = new Reporter();
		reporter.add = jest.fn();
		meta = new MetaTable();
		meta.loadFromFile(path.join(__dirname, "../elements/html5.json"));

		rule = new MockRule({});
		rule.name = "mock-rule";
		rule.init(parser, reporter, Severity.ERROR, meta);
		mockLocation = { filename: "mock-file", offset: 1, line: 1, column: 2 };
		mockEvent = {
			location: mockLocation,
		};
	});

	describe("report()", () => {
		it('should not add message with severity "disabled"', () => {
			rule.setServerity(Severity.DISABLED);
			rule.report(null, "foo");
			expect(reporter.add).not.toHaveBeenCalled();
		});

		it('should add message with severity "warn"', () => {
			const node = new HtmlElement("foo", null);
			rule.setServerity(Severity.WARN);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(
				rule,
				"foo",
				Severity.WARN,
				expect.anything(),
				undefined
			);
		});

		it('should add message with severity "error"', () => {
			const node = new HtmlElement("foo", null);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(
				rule,
				"foo",
				Severity.ERROR,
				expect.anything(),
				undefined
			);
		});

		it("should not add message when disabled", () => {
			rule.setEnabled(false);
			rule.report(null, "foo");
			expect(reporter.add).not.toHaveBeenCalled();
		});

		it("should use explicit location if provided", () => {
			const node = new HtmlElement("foo", null);
			rule.report(node, "foo", mockLocation);
			expect(reporter.add).toHaveBeenCalledWith(
				rule,
				"foo",
				Severity.ERROR,
				mockLocation,
				undefined
			);
		});

		it("should use event location if no explicit location", () => {
			const node = new HtmlElement("foo", null);
			rule.on("*", () => null);
			const callback = (parser.on as any).mock.calls[0][1];
			callback("event", mockEvent);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(
				rule,
				"foo",
				Severity.ERROR,
				mockEvent.location,
				undefined
			);
		});

		it("should use node location if no node location", () => {
			const node = new HtmlElement("foo", null, undefined, null, mockLocation);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(
				rule,
				"foo",
				Severity.ERROR,
				mockLocation,
				undefined
			);
		});

		it("should set context if provided", () => {
			const context = { foo: "bar" };
			const node = new HtmlElement("foo", null);
			rule.report(node, "foo", null, context);
			expect(reporter.add).toHaveBeenCalledWith(
				rule,
				"foo",
				Severity.ERROR,
				expect.anything(),
				{ foo: "bar" }
			);
		});

		it("should not add message if node has disabled rule", () => {
			const node = new HtmlElement("foo", null);
			node.disableRule("mock-rule");
			rule.setServerity(Severity.ERROR);
			rule.report(node, "foo");
			expect(reporter.add).not.toHaveBeenCalled();
		});
	});

	describe("on()", () => {
		let delivered: boolean;
		let callback: (event: string, data: Event) => void;

		beforeEach(() => {
			delivered = false;
			rule.on("*", () => {
				delivered = true;
			});
			callback = (parser.on as any).mock.calls[0][1];
		});

		it('should not deliver events with severity "disabled"', () => {
			rule.setServerity(Severity.DISABLED);
			callback("event", mockEvent);
			expect(delivered).toBeFalsy();
		});

		it('should deliver events with severity "warn"', () => {
			rule.setServerity(Severity.WARN);
			callback("event", mockEvent);
			expect(delivered).toBeTruthy();
		});

		it('should deliver events with severity "error"', () => {
			rule.setServerity(Severity.ERROR);
			callback("event", mockEvent);
			expect(delivered).toBeTruthy();
		});

		it("should not deliver events when disabled", () => {
			rule.setEnabled(false);
			callback("event", mockEvent);
			expect(delivered).toBeFalsy();
		});
	});

	it("documentation() should return null", () => {
		expect(rule.documentation()).toBeNull();
	});

	it("getTagsWithProperty() should lookup properties from metadata", () => {
		const spy = jest.spyOn(meta, "getTagsWithProperty");
		expect(rule.getTagsWithProperty("form")).toEqual(["form"]);
		expect(spy).toHaveBeenCalledWith("form");
	});
});

it("ruleDocumentationUrl() should return URL to rule documentation", () => {
	expect(ruleDocumentationUrl("src/rules/foo.ts")).toEqual(
		"https://html-validate.org/rules/foo.html"
	);
});
