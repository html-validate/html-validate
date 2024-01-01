import { Severity } from "../config";
import { parseSeverity } from "./parse-severity";

it.each`
	value      | severity
	${"off"}   | ${Severity.DISABLED}
	${"warn"}  | ${Severity.WARN}
	${"error"} | ${Severity.ERROR}
	${"0"}     | ${Severity.DISABLED}
	${"1"}     | ${Severity.WARN}
	${"2"}     | ${Severity.ERROR}
`('should parse "$value" as $severity', ({ value, severity }) => {
	expect.assertions(1);
	expect(parseSeverity("mock rule", value)).toBe(severity);
});

it("should throw error if severity cannot be interpreted", () => {
	expect.assertions(1);
	expect(() => parseSeverity("mock rule", "invalid")).toThrow(
		`Invalid severity "invalid" for rule "mock rule"`,
	);
});
