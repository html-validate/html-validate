export { type LoadedPlugin, Config } from "./config";
export {
	type ConfigData,
	type RuleConfig,
	type RuleOptions,
	type TransformMap,
	type RuleSeverity,
} from "./config-data";
export { ConfigLoader } from "./config-loader";
export { defineConfig } from "./define-config";
export { ConfigError } from "./error";
export { default as configPresets } from "./presets";
export { type ResolvedConfigData, type TransformerEntry, ResolvedConfig } from "./resolved-config";
export {
	type Resolver,
	type ResolverOptions,
	type StaticResolver,
	type StaticResolverMap,
	staticResolver,
} from "./resolver";
export { Severity } from "./severity";
