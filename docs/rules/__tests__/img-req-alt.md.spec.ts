import HtmlValidate from '../../../build/htmlvalidate';

const markup = {};
markup["incorrect"] = `<img>`;
markup["correct"] = `<img alt="...">`;
markup["allow-empty"] = `<span>The task was successfully completed! <img src="thumbsup.png" alt=""></span>`;
markup["alias"] = `<img data-alt="...">`;

describe('docs/rules/img-req-alt.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"img-req-alt":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"img-req-alt":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: allow-empty', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"img-req-alt":["error",{"allowEmpty":true}]}});
		const report = htmlvalidate.validateString(markup["allow-empty"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: alias', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"img-req-alt":["error",{"alias":["data-alt"]}]}});
		const report = htmlvalidate.validateString(markup["alias"]);
		expect(report.results).toMatchSnapshot();
	});
});
