import HtmlValidate from '../../../src/htmlvalidate';

const markup = {};
markup["incorrect"] = `<DIV>...</DIV>`;
markup["correct"] = `<div>...</div>`;

describe('docs/rules/element-case.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"element-case":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"element-case":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
