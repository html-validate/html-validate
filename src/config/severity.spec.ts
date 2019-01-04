import { parseSeverity, Severity } from "./severity";

describe("parseSeverity()", () => {
	it("should parse 0", () => {
		expect(parseSeverity(0)).toEqual(Severity.DISABLED);
	});

	it("should parse 1", () => {
		expect(parseSeverity(1)).toEqual(Severity.WARN);
	});

	it("should parse 2", () => {
		expect(parseSeverity(2)).toEqual(Severity.ERROR);
	});

	it('should parse "off"', () => {
		expect(parseSeverity("off")).toEqual(Severity.DISABLED);
	});

	it('should parse "warn"', () => {
		expect(parseSeverity("warn")).toEqual(Severity.WARN);
	});

	it('should parse "error"', () => {
		expect(parseSeverity("error")).toEqual(Severity.ERROR);
	});

	it('should throw error on "foobar"', () => {
		expect(() => parseSeverity("foobar")).toThrow('Invalid severity "foobar"');
	});

	it("should throw error on 3", () => {
		expect(() => parseSeverity(3)).toThrow('Invalid severity "3"');
	});

	it("should throw error on null", () => {
		expect(() => parseSeverity(null)).toThrow('Invalid severity "null"');
	});

	it("should throw error on undefined", () => {
		expect(() => parseSeverity(undefined)).toThrow(
			'Invalid severity "undefined"'
		);
	});
});
