import HtmlValidate from '../../../build/htmlvalidate';

const markup = {};
markup["incorrect"] = `<div class="fooBar"></foobar>`;
markup["correct"] = `<div class="foo-bar"></div>`;

describe('docs/rules/class-pattern.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"class-pattern":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"class-pattern":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
