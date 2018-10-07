import HtmlValidate from '../../../src/htmlvalidate';

const markup = {};
markup["incorrect"] = `<!-- table caption must be used before thead -->
<table>
    <thead></thead>
    <caption></caption>
</div>`;
markup["correct"] = `<table>
    <caption></caption>
    <thead></thead>
</table>`;

describe('docs/rules/element-permitted-order.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"element-permitted-order":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"element-permitted-order":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
