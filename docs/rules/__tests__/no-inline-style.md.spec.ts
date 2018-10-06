import HtmlValidate from '../../../build/htmlvalidate';

const markup = {};
markup["incorrect"] = `<p style="color: red"></p>`;
markup["correct"] = `<p class="error"></p>`;

describe('docs/rules/no-inline-style.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-inline-style":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-inline-style":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
