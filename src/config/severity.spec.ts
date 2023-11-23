import { parseSeverity, Severity } from "./severity";

describe("parseSeverity()", () => {
	it("should parse 0", () => {
		expect.assertions(1);
		expect(parseSeverity(0)).toEqual(Severity.DISABLED);
	});

	it("should parse 1", () => {
		expect.assertions(1);
		expect(parseSeverity(1)).toEqual(Severity.WARN);
	});

	it("should parse 2", () => {
		expect.assertions(1);
		expect(parseSeverity(2)).toEqual(Severity.ERROR);
	});

	it('should parse "off"', () => {
		expect.assertions(1);
		expect(parseSeverity("off")).toEqual(Severity.DISABLED);
	});

	it('should parse "warn"', () => {
		expect.assertions(1);
		expect(parseSeverity("warn")).toEqual(Severity.WARN);
	});

	it('should parse "error"', () => {
		expect.assertions(1);
		expect(parseSeverity("error")).toEqual(Severity.ERROR);
	});

	it('should throw error on "foobar"', () => {
		expect.assertions(1);
		expect(() => parseSeverity("foobar")).toThrow('Invalid severity "foobar"');
	});

	it("should throw error on 3", () => {
		expect.assertions(1);
		expect(() => parseSeverity(3)).toThrow('Invalid severity "3"');
	});

	it("should throw error on null", () => {
		expect.assertions(1);
		expect(() => parseSeverity(null as unknown as string)).toThrow('Invalid severity "null"');
	});

	it("should throw error on undefined", () => {
		expect.assertions(1);
		expect(() => parseSeverity(undefined as unknown as string)).toThrow(
			'Invalid severity "undefined"',
		);
	});
});
