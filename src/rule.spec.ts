import { Config } from "./config";
import { Location } from "./context";
import { HtmlElement } from "./dom";
import { Event } from "./event";
import { Parser } from "./parser";
import { Reporter } from "./reporter";
import { Rule, ruleDocumentationUrl } from "./rule";

class MockRule extends Rule {
	setup(){
		/* do nothing */
	}
}

describe("rule base class", () => {

	let parser: Parser;
	let reporter: Reporter;
	let rule: Rule;
	let mockLocation: Location;
	let mockEvent: Event;

	beforeEach(() => {
		parser = new Parser(Config.empty());
		parser.on = jest.fn();
		reporter = new Reporter();
		reporter.add = jest.fn();

		rule = new MockRule({});
		rule.init(parser, reporter, Config.SEVERITY_ERROR);
		mockLocation = {filename: "mock-file", offset: 1, line: 1, column: 2};
		mockEvent = {
			location: mockLocation,
		};
	});

	describe("report()", () => {

		it('should not add message with severity "disabled"', () => {
			rule.setServerity(Config.SEVERITY_DISABLED);
			rule.report(null, "foo");
			expect(reporter.add).not.toHaveBeenCalled();
		});

		it('should add message with severity "warn"', () => {
			const node = new HtmlElement("foo", null);
			rule.setServerity(Config.SEVERITY_WARN);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(node, rule, "foo", Config.SEVERITY_WARN, expect.anything());
		});

		it('should add message with severity "error"', () => {
			const node = new HtmlElement("foo", null);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(node, rule, "foo", Config.SEVERITY_ERROR, expect.anything());
		});

		it("should not add message when disabled", () => {
			rule.setEnabled(false);
			rule.report(null, "foo");
			expect(reporter.add).not.toHaveBeenCalled();
		});

		it("should use explicit location if provided", () => {
			const node = new HtmlElement("foo", null);
			rule.report(node, "foo", mockLocation);
			expect(reporter.add).toHaveBeenCalledWith(node, rule, "foo", Config.SEVERITY_ERROR, mockLocation);
		});

		it("should use event location if no explicit location", () => {
			const node = new HtmlElement("foo", null);
			rule.on("*", () => null);
			const callback = (parser.on as any).mock.calls[0][1];
			callback("event", mockEvent);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(node, rule, "foo", Config.SEVERITY_ERROR, mockEvent.location);
		});

		it("should use node location if no node location", () => {
			const node = new HtmlElement("foo", null, undefined, null, mockLocation);
			rule.report(node, "foo");
			expect(reporter.add).toHaveBeenCalledWith(node, rule, "foo", Config.SEVERITY_ERROR, mockLocation);
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
			rule.setServerity(Config.SEVERITY_DISABLED);
			callback("event", mockEvent);
			expect(delivered).toBeFalsy();
		});

		it('should deliver events with severity "warn"', () => {
			rule.setServerity(Config.SEVERITY_WARN);
			callback("event", mockEvent);
			expect(delivered).toBeTruthy();
		});

		it('should deliver events with severity "error"', () => {
			rule.setServerity(Config.SEVERITY_ERROR);
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

});

it("ruleDocumentationUrl() should return URL to rule documentation", () => {
	expect(ruleDocumentationUrl("src/rules/foo.ts")).toEqual("https://html-validate.org/rules/foo.html");
});
