import { HtmlValidate } from "../htmlvalidate";
import { type Plugin } from "../plugin";
import "../jest";
import { Rule } from "../rule";
import { staticResolver } from "../config";
import { StaticConfigLoader } from "../browser";

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

const plugin: Plugin = {
	name: "my-plugin",
	rules: {
		"custom/regular": RuleRegular,
		"custom/deprecated": RuleDeprecated,
	},
};

const resolver = staticResolver({
	plugins: {
		"my-plugin": plugin,
	},
});

describe("rule deprecated-rule", () => {
	it("should not report error when no rule is deprecated", async () => {
		expect.assertions(1);
		const loader = new StaticConfigLoader([resolver], {
			plugins: ["my-plugin"],
			rules: {
				"custom/regular": "error",
				"deprecated-rule": "error",
			},
		});
		const htmlvalidate = new HtmlValidate(loader);
		const report = await htmlvalidate.validateString("<div></div>");
		expect(report).toBeValid();
	});

	it("should not report error when no deprecated rule is disabled", async () => {
		expect.assertions(1);
		const loader = new StaticConfigLoader([resolver], {
			plugins: ["my-plugin"],
			rules: {
				"custom/deprecated": "off",
				"deprecated-rule": "error",
			},
		});
		const htmlvalidate = new HtmlValidate(loader);
		const report = await htmlvalidate.validateString("<div></div>");
		expect(report).toBeValid();
	});

	it("should report error when a rule is deprecated", async () => {
		expect.assertions(2);
		const loader = new StaticConfigLoader([resolver], {
			plugins: ["my-plugin"],
			rules: {
				"custom/deprecated": "error",
				"deprecated-rule": "error",
			},
		});
		const htmlvalidate = new HtmlValidate(loader);
		const report = await htmlvalidate.validateString("<div></div>");
		expect(report).toBeInvalid();
		expect(report).toHaveError("deprecated-rule", 'Usage of deprecated rule "custom/deprecated"');
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "deprecated-rule": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("deprecated-rule");
		expect(docs).toMatchSnapshot();
	});

	it("should contain contextual documentation", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "deprecated-rule": "error" },
		});
		const docs = await htmlvalidate.getRuleDocumentation("deprecated-rule", null, "my-rule");
		expect(docs).toMatchSnapshot();
	});
});
