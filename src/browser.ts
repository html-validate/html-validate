/* used when calling require('htmlvalidate'); */

export { default as HtmlValidate } from "./htmlvalidate";
export { AttributeData } from "./parser";
export { Config, ConfigData, ConfigError, ConfigLoader, Severity, configPresets } from "./config";
export { DynamicValue, HtmlElement, NodeClosed, TextNode } from "./dom";
export { EventDump, TokenDump } from "./engine";
export { UserError, SchemaValidationError } from "./error";
export * from "./event";
export { MetaData, MetaElement, MetaTable, MetaCopyableProperty } from "./meta";
export { Rule, RuleDocumentation } from "./rule";
export { Source, Location, ProcessElementContext } from "./context";
export { Report, Reporter, Message, Result } from "./reporter";
export { TransformContext, Transformer, TemplateExtractor } from "./transform";
export { Plugin } from "./plugin";
export { Parser } from "./parser";
export { ruleExists } from "./utils";

/* Bug #127: this line need special care, see rollup.config.js */
export { version } from "../package.json";
