import HtmlValidate from '../../../build/htmlvalidate';

const markup = {};
markup["incorrect"] = `<div></div id="foo">`;
markup["correct"] = `<div id="foo"></div>`;

describe('docs/rules/close-attr.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"close-attr":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"close-attr":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
