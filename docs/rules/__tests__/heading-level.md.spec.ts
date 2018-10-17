import HtmlValidate from '../../../src/htmlvalidate';

const markup: {[key: string]: string} = {};
markup["incorrect"] = `<h1>Heading 1</h1>
<h3>Subheading</h3>`;
markup["correct"] = `<h1>Heading 1</h1>
<h2>Subheading</h2>`;

describe('docs/rules/heading-level.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"heading-level":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"heading-level":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
