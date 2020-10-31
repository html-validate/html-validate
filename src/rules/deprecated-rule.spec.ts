import HtmlValidate from "../htmlvalidate";
import "../matchers";
import { Rule } from "../rule";

class RuleRegular extends Rule {
	public setup(): void {
		/* do nothing */
	}
}

class RuleDeprecated extends Rule {
	public get deprecated(): boolean {
		return true;
	}
	public setup(): void {
		/* do nothing */
	}
}

jest.mock(
	"my-plugin",
	() => ({
		rules: {
			"custom/regular": RuleRegular,
			"custom/deprecated": RuleDeprecated,
		},
	}),
	{ virtual: true }
);

describe("rule deprecated-rule", () => {
	it("should not report error when no rule is deprecated", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			plugins: ["my-plugin"],
			rules: {
				"custom/regular": "error",
				"deprecated-rule": "error",
			},
		});
		const report = htmlvalidate.validateString("<div></div>");
		expect(report).toBeValid();
	});

	it("should not report error when no deprecated rule is disabled", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			plugins: ["my-plugin"],
			rules: {
				"custom/deprecated": "off",
				"deprecated-rule": "error",
			},
		});
		const report = htmlvalidate.validateString("<div></div>");
		expect(report).toBeValid();
	});

	it("should report error when a rule is deprecated", () => {
		expect.assertions(2);
		const htmlvalidate = new HtmlValidate({
			plugins: ["my-plugin"],
			rules: {
				"custom/deprecated": "error",
				"deprecated-rule": "error",
			},
		});
		const report = htmlvalidate.validateString("<div></div>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("deprecated-rule", 'Usage of deprecated rule "custom/deprecated"');
	});

	it("should contain documentation", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "deprecated-rule": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("deprecated-rule")).toMatchSnapshot();
	});

	it("should contain contextual documentation", () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "deprecated-rule": "error" },
		});
		expect(htmlvalidate.getRuleDocumentation("deprecated-rule", null, "my-rule")).toMatchSnapshot();
	});
});
