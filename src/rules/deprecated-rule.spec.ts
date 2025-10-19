import "../jest";
import { StaticConfigLoader } from "../browser";
import { staticResolver } from "../config";
import { HtmlValidate } from "../htmlvalidate";
import { type Plugin } from "../plugin";
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
		const markup = /* HTML */ ` <div></div> `;
		const report = await htmlvalidate.validateString(markup);
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
		const markup = /* HTML */ ` <div></div> `;
		const report = await htmlvalidate.validateString(markup);
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
		const markup = /* HTML */ ` <div></div> `;
		const report = await htmlvalidate.validateString(markup);
		expect(report).toBeInvalid();
		expect(report).toMatchInlineCodeframe(`
			"error: Usage of deprecated rule "custom/deprecated" (deprecated-rule) at inline:1:1:
			> 1 |  <div></div>
			    | ^
			Selector: -"
		`);
	});

	it("should contain documentation", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "deprecated-rule": "error" },
		});
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("deprecated-rule");
		expect(docs).toMatchSnapshot();
	});

	it("should contain contextual documentation", async () => {
		expect.assertions(1);
		const htmlvalidate = new HtmlValidate({
			rules: { "deprecated-rule": "error" },
		});
		/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
		const docs = await htmlvalidate.getRuleDocumentation("deprecated-rule", null, "my-rule");
		expect(docs).toMatchSnapshot();
	});
});
