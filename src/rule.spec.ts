import path from "path";
import { Config, Severity } from "./config";
import { Location } from "./context";
import { HtmlElement } from "./dom";
import { Event } from "./event";
import { Parser } from "./parser";
import { Reporter } from "./reporter";
import { Rule, ruleDocumentationUrl, IncludeExcludeOptions } from "./rule";
import { MetaTable } from "./meta";

interface RuleContext {
	foo: string;
}

class MockRule extends Rule<RuleContext> {
	public setup(): void {
		/* do nothing */
	}
}

describe("rule base class", () => {
	let parser: Parser;
	let reporter: Reporter;
	let meta: MetaTable;
	let rule: MockRule;
	let mockLocation: Location;
	let mockEvent: Event;

	beforeEach(() => {
		parser = new Parser(Config.empty());
		parser.on = jest.fn();
		reporter = new Reporter();
		reporter.add = jest.fn();
		meta = new MetaTable();
		meta.loadFromFile(path.join(__dirname, "../elements/html5.json"));

		rule = new MockRule();
		rule.name = "mock-rule";
		rule.init(parser, reporter, Severity.ERROR, meta);
		mockLocation = {
			filename: "mock-file",
			offset: 1,
			line: 1,
			column: 2,
			size: 1,
		};
		mockEvent = {
			location: mockLocation,
		};
	});

	describe("report()", () => {
		it('should not add message with severity "disabled"', () => {
			expect.assertions(1);
			rule.setServerity(Severity.DISABLED);
			rule.report(null, "foo");
			expect(reporter.add).not.toHaveBeenCalled();
		});

		it('should add message with severity "warn"', () => {
			expect.assertions(1);
			const node = new HtmlElement("foo", null);
			rule.setServerity(Severity.WARN);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(
				rule,
				"foo",
				Severity.WARN,
				expect.objectContaining({
					unique: node.unique,
				}),
				expect.anything(),
				undefined
			);
		});

		it('should add message with severity "error"', () => {
			expect.assertions(1);
			const node = new HtmlElement("foo", null);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(
				rule,
				"foo",
				Severity.ERROR,
				expect.objectContaining({
					unique: node.unique,
				}),
				expect.anything(),
				undefined
			);
		});

		it("should not add message when disabled", () => {
			expect.assertions(1);
			rule.setEnabled(false);
			rule.report(null, "foo");
			expect(reporter.add).not.toHaveBeenCalled();
		});

		it("should use explicit location if provided", () => {
			expect.assertions(1);
			const node = new HtmlElement("foo", null);
			rule.report(node, "foo", mockLocation);
			expect(reporter.add).toHaveBeenCalledWith(
				rule,
				"foo",
				Severity.ERROR,
				expect.objectContaining({
					unique: node.unique,
				}),
				mockLocation,
				undefined
			);
		});

		it("should use event location if no explicit location", () => {
			expect.assertions(1);
			const node = new HtmlElement("foo", null);
			rule.on("*", () => null);
			const callback = (parser.on as any).mock.calls[0][1];
			callback("event", mockEvent);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(
				rule,
				"foo",
				Severity.ERROR,
				expect.objectContaining({
					unique: node.unique,
				}),
				mockEvent.location,
				undefined
			);
		});

		it("should use node location if no node location", () => {
			expect.assertions(1);
			const node = new HtmlElement("foo", null, undefined, null, mockLocation);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(
				rule,
				"foo",
				Severity.ERROR,
				expect.objectContaining({
					unique: node.unique,
				}),
				mockLocation,
				undefined
			);
		});

		it("should set context if provided", () => {
			expect.assertions(1);
			const context = { foo: "bar" };
			const node = new HtmlElement("foo", null);
			rule.report(node, "foo", null, context);
			expect(reporter.add).toHaveBeenCalledWith(
				rule,
				"foo",
				Severity.ERROR,
				expect.objectContaining({
					unique: node.unique,
				}),
				expect.anything(),
				{ foo: "bar" }
			);
		});

		it("should not add message if node has disabled rule", () => {
			expect.assertions(1);
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
			expect.assertions(1);
			rule.setServerity(Severity.DISABLED);
			callback("event", mockEvent);
			expect(delivered).toBeFalsy();
		});

		it('should deliver events with severity "warn"', () => {
			expect.assertions(1);
			rule.setServerity(Severity.WARN);
			callback("event", mockEvent);
			expect(delivered).toBeTruthy();
		});

		it('should deliver events with severity "error"', () => {
			expect.assertions(1);
			rule.setServerity(Severity.ERROR);
			callback("event", mockEvent);
			expect(delivered).toBeTruthy();
		});

		it("should not deliver events when disabled", () => {
			expect.assertions(1);
			rule.setEnabled(false);
			callback("event", mockEvent);
			expect(delivered).toBeFalsy();
		});
	});

	it("documentation() should return null", () => {
		expect.assertions(1);
		expect(rule.documentation()).toBeNull();
	});

	describe("isKeywordIgnored()", () => {
		class RuleWithOption extends Rule<void, IncludeExcludeOptions> {
			public setup(): void {
				/* do nothing */
			}
		}

		let rule: RuleWithOption;
		let options: IncludeExcludeOptions;

		beforeEach(() => {
			options = {
				include: null,
				exclude: null,
			};
			rule = new RuleWithOption(options);
		});

		it('should return true if keyword is not present in "include"', () => {
			expect.assertions(2);
			options.include = ["foo"];
			expect(rule.isKeywordIgnored("foo")).toBeFalsy();
			expect(rule.isKeywordIgnored("bar")).toBeTruthy();
		});

		it('should return true if keyword is present in "exclude"', () => {
			expect.assertions(2);
			options.exclude = ["foo"];
			expect(rule.isKeywordIgnored("foo")).toBeTruthy();
			expect(rule.isKeywordIgnored("bar")).toBeFalsy();
		});

		it('should return true if keyword satisfies both "include" and "exclude"', () => {
			expect.assertions(2);
			options.include = ["foo", "bar"];
			options.exclude = ["bar"];
			expect(rule.isKeywordIgnored("foo")).toBeFalsy();
			expect(rule.isKeywordIgnored("bar")).toBeTruthy();
		});
	});

	it("getTagsWithProperty() should lookup properties from metadata", () => {
		expect.assertions(2);
		const spy = jest.spyOn(meta, "getTagsWithProperty");
		expect(rule.getTagsWithProperty("form")).toEqual(["form"]);
		expect(spy).toHaveBeenCalledWith("form");
	});

	it("getTagsDerivedFrom() should lookup properties from metadata", () => {
		expect.assertions(2);
		const spy = jest.spyOn(meta, "getTagsDerivedFrom");
		expect(rule.getTagsDerivedFrom("form")).toEqual(["form"]);
		expect(spy).toHaveBeenCalledWith("form");
	});
});

it("ruleDocumentationUrl() should return URL to rule documentation", () => {
	expect.assertions(1);
	expect(ruleDocumentationUrl("src/rules/foo.ts")).toEqual(
		"https://html-validate.org/rules/foo.html"
	);
});
