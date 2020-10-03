/* used when calling require('htmlvalidate'); */

export { default as HtmlValidate } from "./htmlvalidate";
export { AttributeData } from "./parser";
export { CLI } from "./cli/cli";
export { Config, ConfigData, ConfigError, ConfigLoader, Severity } from "./config";
export { DynamicValue, HtmlElement, NodeClosed, TextNode } from "./dom";
export { UserError } from "./error";
export { Rule, RuleDocumentation } from "./rule";
export { Source, Location, ProcessElementContext } from "./context";
export { Report, Reporter, Message, Result } from "./reporter";
export { Transformer, TemplateExtractor } from "./transform";
export { Plugin } from "./plugin";
export { Parser } from "./parser";

const pkg = require("../package.json");

export const version = pkg.version;
