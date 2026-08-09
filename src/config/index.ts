export { type LoadedPlugin, Config } from "./config";
export { type ConfigData, type TransformMap } from "./config-data";
export { type RuleConfig } from "./rule-config";
export { type RuleOptions } from "./rule-options";
export { ConfigLoader } from "./config-loader";
export { defineConfig } from "./define-config";
export { ConfigError } from "./error";
export { default as configPresets } from "./presets";
export { type ResolvedConfigData, ResolvedConfig } from "./resolved-config";
export {
	type Resolver,
	type ResolverOptions,
	type StaticResolver,
	type StaticResolverMap,
	resolveConfig,
	resolveElements,
	resolvePlugin,
	resolveTransformer,
	staticResolver,
} from "./resolver";
export { type RuleSeverity } from "./rule-severity";
export { Severity } from "./severity";
