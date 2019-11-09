/* used when calling require('htmlvalidate'); */

export { default as HtmlValidate } from "./htmlvalidate";
export { AttributeData } from "./parser";
export { CLI } from "./cli/cli";
export { Config, ConfigData, ConfigLoader, Severity } from "./config";
export { DynamicValue, HtmlElement } from "./dom";
export { Rule } from "./rule";
export { Source, Location } from "./context";
export { Reporter, Message, Result } from "./reporter";
export { TemplateExtractor } from "./transform/template";

const pkg = require("../package.json");
export const version = pkg.version;
