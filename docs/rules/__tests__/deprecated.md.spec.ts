import HtmlValidate from '../../../src/htmlvalidate';

const markup: {[key: string]: string} = {};
markup["incorrect"] = `<center>...</center>
<big>...</big>`;
markup["correct"] = `<main>...</main>`;
markup["custom-message"] = `<my-element>...</my-element>`;

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
	it('inline validation: custom-message', () => {
		const htmlvalidate = new HtmlValidate({"elements":["html5",{"my-element":{"deprecated":"replaced with <other-element>"}}],"rules":{"deprecated":"error"}});
		const report = htmlvalidate.validateString(markup["custom-message"]);
		expect(report.results).toMatchSnapshot();
	});
});
