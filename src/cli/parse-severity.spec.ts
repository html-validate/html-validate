import { parseSeverity } from "./parse-severity";

it.each`
	value      | severity
	${"off"}   | ${"off"}
	${"warn"}  | ${"warn"}
	${"error"} | ${"error"}
	${"0"}     | ${"off"}
	${"1"}     | ${"warn"}
	${"2"}     | ${"error"}
`(
	'should parse "$value" as $severity',
	({ value, severity }: { value: string; severity: string }) => {
		expect.assertions(1);
		expect(parseSeverity("mock rule", value)).toBe(severity);
	},
);

it("should throw error if severity cannot be interpreted", () => {
	expect.assertions(1);
	expect(() => parseSeverity("mock rule", "invalid")).toThrow(
		`Invalid severity "invalid" for rule "mock rule"`,
	);
});
