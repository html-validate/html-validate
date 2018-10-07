import HtmlValidate from '../../../src/htmlvalidate';

const markup = {};
markup["incorrenct"] = `<!-- missing type -->
<button>...</button>

<!-- invalid type -->
<button type="foo">...</button>`;
markup["correct"] = `<button type="button">...</button>`;

describe('docs/rules/button-type.md', () => {
	it('inline validation: incorrenct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"button-type":"error"}});
		const report = htmlvalidate.validateString(markup["incorrenct"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"button-type":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
