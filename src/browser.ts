/* used when calling require('htmlvalidate'); */

export { default as HtmlValidate } from "./htmlvalidate";
export { AttributeData } from "./parser";
export { Config, ConfigData, ConfigError, ConfigLoader, Severity } from "./config";
export { DynamicValue, HtmlElement, NodeClosed, TextNode } from "./dom";
export { EventDump, TokenDump } from "./engine";
export { UserError, SchemaValidationError } from "./error";
export * from "./event";
export { MetaData, MetaElement, MetaTable } from "./meta";
export { Rule, RuleDocumentation } from "./rule";
export { Source, Location, ProcessElementContext } from "./context";
export { Report, Reporter, Message, Result } from "./reporter";
export { Transformer, TemplateExtractor } from "./transform";
export { Plugin } from "./plugin";
export { Parser } from "./parser";
export { ruleExists } from "./utils";

const pkg = require("../package.json");

export const version = pkg.version;
