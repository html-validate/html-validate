import HtmlValidate from '../../../src/htmlvalidate';

const markup: {[key: string]: string} = {};
markup["incorrect"] = `<div id="fooBar"></foobar>`;
markup["correct"] = `<div id="foo-bar"></div>`;

describe('docs/rules/id-pattern.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"id-pattern":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"id-pattern":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
