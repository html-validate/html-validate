/* used when calling require('htmlvalidate'); */

export { default as HtmlValidate } from "./htmlvalidate";
export { type AttributeData } from "./parser";
export {
	Config,
	type ConfigData,
	ConfigError,
	ConfigLoader,
	Severity,
	configPresets,
} from "./config";
export { StaticConfigLoader } from "./config/loaders/static";
export {
	Attribute,
	DynamicValue,
	HtmlElement,
	NodeClosed,
	TextNode,
	type CSSStyleDeclaration,
} from "./dom";
export { type EventDump, type TokenDump } from "./engine";
export { UserError, SchemaValidationError, NestedError, WrappedError } from "./error";
export * from "./event";
export { version } from "./generated/package";
export {
	type MetaData,
	type MetaDataTable,
	type MetaElement,
	type MetaAttribute,
	type MetaAttributeAllowedCallback,
	MetaTable,
	MetaCopyableProperty,
	defineMetadata,
	metadataHelper,
} from "./meta";
export { Rule, type RuleConstructor, type RuleDocumentation, type SchemaObject } from "./rule";
export {
	type IncludeExcludeOptions,
	TextClassification,
	classifyNodeText,
	keywordPatternMatcher,
} from "./rules/helper";
export {
	type Source,
	type SourceHooks,
	type Location,
	type ProcessAttributeCallback,
	type ProcessElementCallback,
	type ProcessElementContext,
	sliceLocation,
} from "./context";
export { type Report, Reporter, type Message, type Result, type DeferredMessage } from "./reporter";
export { type TransformContext, type Transformer, TemplateExtractor } from "./transform";
export { type Plugin, type SchemaValidationPatch, definePlugin } from "./plugin";
export { Parser } from "./parser";
export { ruleExists } from "./utils";
