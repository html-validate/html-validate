import HtmlValidate from '../../../src/htmlvalidate';

const markup = {};
markup["incorrect"] = `<html>
    <body>...</body>
</html>`;
markup["correct"] = `<!doctype html>
<html>
    <body>...</body>
</html>`;

describe('docs/rules/missing-doctype.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"missing-doctype":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"missing-doctype":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
