import HtmlValidate from '../../../build/htmlvalidate';

const markup = {};
markup["incorrect"] = `<div class="foo bar foo"></div>`;
markup["correct"] = `<div class="foo bar"></div>`;

describe('docs/rules/no-dup-class.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-dup-class":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"no-dup-class":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
