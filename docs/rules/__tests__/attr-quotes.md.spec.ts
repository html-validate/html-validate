import HtmlValidate from '../../../build/htmlvalidate';

const markup = {};
markup["incorrect"] = `<p><strong></p></strong>`;
markup["correct"] = `<p><strong></strong></p>`;

describe('docs/rules/attr-quotes.md', () => {
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
