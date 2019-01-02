/* used when calling require('htmlvalidate'); */

const HtmlValidate = require("./build/htmlvalidate").default;
const TemplateExtractor = require("./build/transform/template")
	.TemplateExtractor;
const Rule = require("./build/rule").Rule;

module.exports = {
	HtmlValidate,
	TemplateExtractor,
	Rule,
};
