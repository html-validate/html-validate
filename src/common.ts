/* used when calling require('htmlvalidate'); */

export { HtmlValidate } from "./htmlvalidate";
export { type AttributeData } from "./parser";
export {
	type ConfigData,
	type LoadedPlugin,
	type ResolvedConfigData,
	type Resolver,
	type ResolverOptions,
	type RuleConfig,
	type RuleOptions,
	type RuleSeverity,
	type StaticResolver,
	type StaticResolverMap,
	type TransformMap,
	type TransformerEntry,
	Config,
	ConfigError,
	ConfigLoader,
	ResolvedConfig,
	Severity,
	configPresets,
	defineConfig,
	staticResolver,
} from "./config";
export { StaticConfigLoader } from "./config/loaders/static";
export {
	type CSSStyleDeclaration,
	type DOMInternalID,
	type DOMNodeCache,
	Attribute,
	DOMNode,
	DOMTokenList,
	DOMTree,
	DynamicValue,
	HtmlElement,
	NodeClosed,
	NodeType,
	TextNode,
} from "./dom";
export { type EventDump, type RuleBlocker, type TokenDump } from "./engine";
export { NestedError, SchemaValidationError, UserError, WrappedError } from "./error";
export * from "./event";
export { version } from "./generated/package";
export {
	type AttrNameToken,
	type AttrValueToken,
	type BaseToken,
	type CommentToken,
	type ConditionalToken,
	type DirectiveToken,
	type DoctypeCloseToken,
	type DoctypeOpenToken,
	type DoctypeValueToken,
	type EOFToken,
	type ScriptToken,
	type StyleToken,
	type TagCloseToken,
	type TagOpenToken,
	type TemplatingToken,
	type TextToken,
	type Token,
	type TokenStream,
	type TokenType,
	type UnicodeBOMToken,
	type WhitespaceToken,
} from "./lexer";
export {
	type CategoryOrTag,
	type DeprecatedElement,
	type FormAssociated,
	type HtmlElementLike,
	type MetaAria,
	type MetaAttribute,
	type MetaAttributeAllowedCallback,
	type MetaData,
	type MetaDataTable,
	type MetaElement,
	type MetaFocusableCallback,
	type MetaImplicitRoleCallback,
	type MetaLookupableProperty,
	type MetadataHelper,
	type NormalizedMetaAria,
	type Permitted,
	type PermittedAttribute,
	type PermittedEntry,
	type PermittedGroup,
	type PermittedOrder,
	type PropertyExpression,
	type RequiredAncestors,
	type RequiredContent,
	MetaCopyableProperty,
	MetaTable,
	TextContent,
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
	ariaNaming,
	TextClassification,
	classifyNodeText,
	keywordPatternMatcher,
} from "./rules/helper";
export {
	type Location,
	type ProcessAttributeCallback,
	type ProcessElementCallback,
	type ProcessElementContext,
	type Source,
	type SourceHooks,
	sliceLocation,
} from "./context";
export { type DeferredMessage, type Message, type Report, type Result, Reporter } from "./reporter";
export { type TransformContext, type Transformer } from "./transform";
export { type Plugin, type SchemaValidationPatch, definePlugin } from "./plugin";
export { Parser } from "./parser";
export { type CompatibilityOptions, ruleExists } from "./utils";
