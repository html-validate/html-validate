import HtmlValidate from '../../../build/htmlvalidate';

const markup = {};
markup["incorrect"] = `<!-- <li> is only allowed with <ul> or <ol> as parent -->
<div>
    <li>foo</li>
</div>`;
markup["correct"] = `<ul>
    <li>foo</li>
</ul>`;

describe('docs/rules/element-permitted-content.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"element-permitted-content":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"element-permitted-content":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
