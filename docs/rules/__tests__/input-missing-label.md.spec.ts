import HtmlValidate from '../../../src/htmlvalidate';

const markup = {};
markup["incorrect"] = `<!-- no label element at all -->
<div>
    <strong>My field</strong>
    <input type="text">
</div>

<!-- unassociated label -->
<div>
    <label>My field</label>
    <input type="text">
</div>`;
markup["correct"] = `<!-- label with descendant -->
<div>
    <label>My field <input type="text"></label>
</div>

<!-- associated label -->
<div>
    <label for="my-field">My field</label>
    <input id="my-field" type="text">
</div>`;

describe('docs/rules/input-missing-label.md', () => {
	it('inline validation: incorrect', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"input-missing-label":"error"}});
		const report = htmlvalidate.validateString(markup["incorrect"]);
		expect(report.results).toMatchSnapshot();
	});
	it('inline validation: correct', () => {
		const htmlvalidate = new HtmlValidate({"rules":{"input-missing-label":"error"}});
		const report = htmlvalidate.validateString(markup["correct"]);
		expect(report.results).toMatchSnapshot();
	});
});
