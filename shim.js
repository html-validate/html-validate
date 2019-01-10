/* used when calling require('htmlvalidate'); */

const DynamicValue = require("./build/dom/dynamic-value").DynamicValue;
const HtmlValidate = require("./build/htmlvalidate").default;
const TemplateExtractor = require("./build/transform/template")
	.TemplateExtractor;
const Rule = require("./build/rule").Rule;

module.exports = {
	DynamicValue,
	HtmlValidate,
	TemplateExtractor,
	Rule,
};
