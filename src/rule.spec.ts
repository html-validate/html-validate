import path from "path";
import { Config, ConfigData, Severity } from "./config";
import { Location } from "./context";
import { HtmlElement, NodeClosed } from "./dom";
import { Event, EventCallback, TagEndEvent, TagStartEvent } from "./event";
import { Parser } from "./parser";
import { Reporter } from "./reporter";
import { Rule, ruleDocumentationUrl, IncludeExcludeOptions, SchemaObject } from "./rule";
import { MetaTable } from "./meta";
import { bundledElements } from "./elements";

interface RuleContext {
	foo: string;
}

class MockRule extends Rule<RuleContext> {
	public setup(): void {
		/* do nothing */
	}
}

const location: Location = {
	filename: "inline",
	line: 1,
	column: 1,
	offset: 0,
	size: 1,
};

describe("rule base class", () => {
	let parser: Parser;
	let parserOn: jest.SpyInstance<() => void, [event: string, listener: EventCallback]>;
	let reporter: Reporter;
	let meta: MetaTable;
	let rule: MockRule;
	let mockLocation: Location;
	let mockEvent: Event;

	beforeEach(() => {
		parser = new Parser(Config.empty().resolve());
		parserOn = jest.spyOn(parser, "on");
		reporter = new Reporter();
		reporter.add = jest.fn();
		meta = new MetaTable();
		meta.loadFromObject(bundledElements.html5);

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
			const node = new HtmlElement("foo", null, NodeClosed.EndTag, null, location);
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
			const node = new HtmlElement("foo", null, NodeClosed.EndTag, null, location);
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
			const node = new HtmlElement("foo", null, NodeClosed.EndTag, null, location);
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
			const node = new HtmlElement("foo", null, NodeClosed.EndTag, null, location);
			rule.on("*", () => null);
			const callback = parserOn.mock.calls[0][1];
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
			const node = new HtmlElement("foo", null, NodeClosed.EndTag, null, mockLocation);
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
			const node = new HtmlElement("foo", null, NodeClosed.EndTag, null, location);
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
			const node = new HtmlElement("foo", null, NodeClosed.EndTag, null, location);
			node.disableRule("mock-rule");
			rule.setServerity(Severity.ERROR);
			rule.report(node, "foo");
			expect(reporter.add).not.toHaveBeenCalled();
		});

		it("should interpolate string", () => {
			expect.assertions(1);
			const node = new HtmlElement("foo", null, NodeClosed.EndTag, null, location);
			const context: RuleContext = { foo: "bar" };
			rule.report(node, "foo {{ foo }}", mockLocation, context);
			expect(reporter.add).toHaveBeenCalledWith(
				rule,
				"foo bar",
				Severity.ERROR,
				expect.objectContaining({
					unique: node.unique,
				}),
				mockLocation,
				context
			);
		});
	});

	describe("on()", () => {
		let delivered: boolean;
		let callback: (event: string, data: Event) => void;

		describe("severity", () => {
			beforeEach(() => {
				delivered = false;
				rule.on("*", () => {
					delivered = true;
				});
				callback = parserOn.mock.calls[0][1];
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

		describe("filter", () => {
			let filterResult: boolean;

			beforeEach(() => {
				delivered = false;
				rule.on(
					"*",
					() => filterResult,
					() => {
						delivered = true;
					}
				);
				callback = parserOn.mock.calls[0][1];
			});

			it("should deliver event when filter return true", () => {
				expect.assertions(1);
				filterResult = true;
				callback("event", mockEvent);
				expect(delivered).toBeTruthy();
			});

			it("should not deliver event when filter return false", () => {
				expect.assertions(1);
				filterResult = false;
				callback("event", mockEvent);
				expect(delivered).toBeFalsy();
			});
		});

		it("should support tag:open as alias for tag:start", () => {
			expect.assertions(1);
			const spy = jest.fn();
			const eventData: TagStartEvent = {
				location,
				target: null as unknown as HtmlElement,
			};
			rule.on("tag:open", spy);
			parser.trigger("tag:start", eventData);
			expect(spy).toHaveBeenCalledWith(eventData);
		});

		it("should support tag:close as alias for tag:end", () => {
			expect.assertions(1);
			const spy = jest.fn();
			const eventData: TagEndEvent = {
				location,
				target: null as unknown as HtmlElement,
				previous: null as unknown as HtmlElement,
			};
			rule.on("tag:close", spy);
			parser.trigger("tag:end", eventData);
			expect(spy).toHaveBeenCalledWith(eventData);
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

describe("isEnabled()", () => {
	it.each`
		enabled | severity | result
		${1}    | ${0}     | ${false}
		${1}    | ${1}     | ${true}
		${1}    | ${2}     | ${true}
		${0}    | ${0}     | ${false}
		${0}    | ${1}     | ${false}
		${0}    | ${2}     | ${false}
	`("enabled=$enabled, severity=$severity should be $result", ({ enabled, severity, result }) => {
		expect.assertions(1);
		const rule = new MockRule();
		rule.setEnabled(Boolean(enabled));
		rule.setServerity(severity);
		expect(rule.isEnabled()).toEqual(result);
	});
});

it("should not be deprecated by default", () => {
	expect.assertions(1);
	const rule = new MockRule();
	expect(rule.deprecated).toBeFalsy();
});

it("should be off by default", () => {
	expect.assertions(1);
	const rule = new MockRule();
	expect(rule.getSeverity()).toEqual(Severity.DISABLED);
});

describe("validateOptions()", () => {
	class MockRuleSchema extends Rule {
		public static schema(): SchemaObject {
			return {
				foo: {
					type: "number",
				},
			};
		}

		public setup(): void {
			/* do nothing */
		}
	}

	it("should throw validation error if options does not match schema", () => {
		expect.assertions(1);
		const options = { foo: "bar" };
		const config: ConfigData = {
			rules: {
				"mock-rule-invalid": ["error", options],
			},
		};
		const jsonPath = "/rules/mock-rule-invalid/1";
		expect(() => {
			return Rule.validateOptions(
				MockRuleSchema,
				"mock-rule-invalid",
				jsonPath,
				options,
				"inline",
				config
			);
		}).toThrowErrorMatchingInlineSnapshot(
			`"Rule configuration error: /rules/mock-rule-invalid/1/foo: type must be number"`
		);
	});

	it("should not throw validation error if options matches schema", () => {
		expect.assertions(1);
		const options = { foo: 12 };
		const config: ConfigData = {
			rules: {
				"mock-rule-valid": ["error", options],
			},
		};
		const jsonPath = "/rules/mock-rule-valid/1";
		expect(() => {
			return Rule.validateOptions(
				MockRuleSchema,
				"mock-rule-valid",
				jsonPath,
				options,
				"inline",
				config
			);
		}).not.toThrow();
	});

	it("should handle rules without schema", () => {
		expect.assertions(1);
		const options = { foo: "spam" };
		const config: ConfigData = {
			rules: {
				"mock-rule-no-schema": ["error", options],
			},
		};
		const jsonPath = "/rules/mock-rule-no-schema/1";
		expect(() => {
			return Rule.validateOptions(
				MockRule,
				"mock-rule-no-schema",
				jsonPath,
				options,
				"inline",
				config
			);
		}).not.toThrow();
	});

	it("should handle missing class", () => {
		expect.assertions(1);
		const options = { foo: "spam" };
		const config: ConfigData = {
			rules: {
				"mock-rule-undefined": ["error", options],
			},
		};
		const jsonPath = "/rules/mock-rule-undefined/1";
		expect(() => {
			return Rule.validateOptions(
				undefined,
				"mock-rule-undefined",
				jsonPath,
				options,
				"inline",
				config
			);
		}).not.toThrow();
	});
});

describe("ruleDocumentationUrl()", () => {
	it("should return URL to rule documentation", () => {
		expect.assertions(1);
		const filename = path.join(__dirname, "rules/foo.ts");
		const url = ruleDocumentationUrl(filename);
		expect(url).toBe("https://html-validate.org/rules/foo.html");
	});

	it("should handle rules in subdirectories", () => {
		expect.assertions(1);
		const filename = path.join(__dirname, "rules/foo/bar.ts");
		const url = ruleDocumentationUrl(filename);
		expect(url).toBe("https://html-validate.org/rules/foo/bar.html");
	});
});
