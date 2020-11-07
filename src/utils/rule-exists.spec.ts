jest.mock("../rules", () => {
	return {
		"existing-rule": (): null => null,
	};
});

import { ruleExists } from "./rule-exists";

it("should return true if rule exists", () => {
	expect.assertions(1);
	expect(ruleExists("existing-rule")).toBeTruthy();
});

it("should return false if rule is missing", () => {
	expect.assertions(1);
	expect(ruleExists("missing-rule")).toBeFalsy();
});
