/* used when calling require('htmlvalidate'); */

export { default as HtmlValidate } from "./htmlvalidate";
export { AttributeData } from "./parser";
export { CLI } from "./cli/cli";
export { Config, ConfigData, ConfigLoader } from "./config";
export { DynamicValue, HtmlElement } from "./dom";
export { Rule } from "./rule";
export { Source } from "./context";
export { Reporter } from "./reporter";
export { TemplateExtractor } from "./transform/template";
