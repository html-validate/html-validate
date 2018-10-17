import HtmlValidate from '../../../src/htmlvalidate';

const markup: {[key: string]: string} = {};
markup["incorrect"] = `<foobar></foobar>`;
markup["correct"] = `<div></div>
<foo-bar></foo-bar>`;

describe('docs/rules/element-name.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"element-name":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"element-name":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
