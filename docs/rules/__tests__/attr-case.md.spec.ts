import HtmlValidate from '../../../src/htmlvalidate';

const markup: {[key: string]: string} = {};
markup["incorrect"] = `<p ID="foo"></p>`;
markup["correct"] = `<p id="foo"></p>`;

describe('docs/rules/attr-case.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"attr-case":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"attr-case":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
