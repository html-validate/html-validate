/* used when calling require('htmlvalidate'); */

export { default as HtmlValidate } from "./htmlvalidate";
export { AttributeData } from "./parser";
export { Config, ConfigData, ConfigError, ConfigLoader, Severity, configPresets } from "./config";
export { StaticConfigLoader } from "./config/loaders/static";
export { DynamicValue, HtmlElement, NodeClosed, TextNode, type CSSStyleDeclaration } from "./dom";
export { EventDump, TokenDump } from "./engine";
export { UserError, SchemaValidationError, NestedError, WrappedError } from "./error";
export * from "./event";
export { version } from "./generated/package";
export { MetaData, MetaElement, MetaTable, MetaCopyableProperty } from "./meta";
export { Rule, RuleDocumentation } from "./rule";
export { Source, Location, ProcessElementContext } from "./context";
export { Report, Reporter, Message, Result, type DeferredMessage } from "./reporter";
export { TransformContext, Transformer, TemplateExtractor } from "./transform";
export { Plugin } from "./plugin";
export { Parser } from "./parser";
export { ruleExists } from "./utils";
