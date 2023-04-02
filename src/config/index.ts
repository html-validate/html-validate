export { type LoadedPlugin, Config, configDataFromFile } from "./config";
export {
	type ConfigData,
	type RuleConfig,
	type RuleOptions,
	type TransformMap,
	type RuleSeverity,
} from "./config-data";
export { ConfigLoader, type ConfigFactory } from "./config-loader";
export { ConfigError } from "./error";
export { default as configPresets } from "./presets";
export { type ResolvedConfigData, type TransformerEntry, ResolvedConfig } from "./resolved-config";
export { Severity } from "./severity";
