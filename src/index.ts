/* used when calling require('htmlvalidate'); */

export * from "./browser";
export { type CLIOptions, type ExpandOptions, type InitResult, CLI } from "./cli";
export { FileSystemConfigLoader } from "./config/loaders/file-system";
export {
	type AvailableFormatters,
	type Formatter,
	getFormatter as formatterFactory,
} from "./formatters";
export { compatibilityCheck, type CompatibilityOptions } from "./utils";
