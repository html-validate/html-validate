import HtmlValidate from '../../../src/htmlvalidate';

const markup: {[key: string]: string} = {};
markup["incorrect"] = `<center>...</center>
<big>...</big>`;
markup["correct"] = `<main>...</main>`;

describe('docs/rules/deprecated.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"deprecated":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"deprecated":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
