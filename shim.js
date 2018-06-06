/* used when calling require('htmlvalidate'); */

const HtmlValidate = require('./build/htmlvalidate').default;
const TemplateExtractor = require('./build/transform/template').TemplateExtractor;

module.exports = {
	HtmlValidate,
	TemplateExtractor,
};
