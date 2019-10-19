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
		const htmlvalidate = new HtmlValidate({
			plugins: ["my-plugin"],
			rules: {
				"custom/deprecated": "error",
				"deprecated-rule": "error",
			},
		});
		const report = htmlvalidate.validateString("<div></div>");
		expect(report).toBeInvalid();
		expect(report).toHaveError(
			"deprecated-rule",
			'Usage of deprecated rule "custom/deprecated"'
		);
	});

	it("should contain documentation", () => {
		const htmlvalidate = new HtmlValidate();
		expect(
			htmlvalidate.getRuleDocumentation("deprecated-rule")
		).toMatchSnapshot();
	});
});
