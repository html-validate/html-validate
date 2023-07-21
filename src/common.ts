/* used when calling require('htmlvalidate'); */

export { HtmlValidate } from "./htmlvalidate";
export { type AttributeData } from "./parser";
export {
	Config,
	type ConfigData,
	type TransformMap,
	type RuleConfig,
	type RuleOptions,
	type TransformerEntry,
	type ResolvedConfigData,
	type Resolver,
	type ResolverOptions,
	type RuleSeverity,
	type StaticResolver,
	type StaticResolverMap,
	type LoadedPlugin,
	ResolvedConfig,
	ConfigError,
	ConfigLoader,
	Severity,
	configPresets,
	staticResolver,
} from "./config";
export { StaticConfigLoader } from "./config/loaders/static";
export {
	Attribute,
	DynamicValue,
	DOMTokenList,
	HtmlElement,
	NodeClosed,
	TextNode,
	DOMNode,
	DOMTree,
	type DOMInternalID,
	type DOMNodeCache,
	NodeType,
	type CSSStyleDeclaration,
} from "./dom";
export { type EventDump, type TokenDump, type RuleBlocker } from "./engine";
export { UserError, SchemaValidationError, NestedError, WrappedError } from "./error";
export * from "./event";
export { version } from "./generated/package";
export {
	type AttrNameToken,
	type CommentToken,
	type ConditionalToken,
	type DirectiveToken,
	type DoctypeOpenToken,
	type Token,
	type TokenStream,
	type TokenType,
	type BaseToken,
	type UnicodeBOMToken,
	type WhitespaceToken,
	type DoctypeValueToken,
	type DoctypeCloseToken,
	type AttrValueToken,
	type TextToken,
	type TemplatingToken,
	type ScriptToken,
	type StyleToken,
	type TagCloseToken,
	type TagOpenToken,
	type EOFToken,
} from "./lexer";
export {
	type MetaData,
	type MetaDataTable,
	type MetaElement,
	type MetaAttribute,
	type MetaAttributeAllowedCallback,
	type DeprecatedElement,
	type FormAssociated,
	type PermittedAttribute,
	type Permitted,
	type RequiredAncestors,
	type PermittedOrder,
	type CategoryOrTag,
	type MetaLookupableProperty,
	type RequiredContent,
	type PropertyExpression,
	type PermittedEntry,
	type PermittedGroup,
	TextContent,
	type MetadataHelper,
	MetaTable,
	MetaCopyableProperty,
	Validator,
	defineMetadata,
	metadataHelper,
} from "./meta";
export {
	type ErrorDescriptor,
	type RuleConstructor,
	type RuleDocumentation,
	type SchemaObject,
	Rule,
} from "./rule";
export {
	type IncludeExcludeOptions,
	type TextClassificationOptions,
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
export { type TransformContext, type Transformer } from "./transform";
export { type Plugin, type SchemaValidationPatch, definePlugin } from "./plugin";
export { Parser } from "./parser";
export { type CompatibilityOptions, ruleExists } from "./utils";
