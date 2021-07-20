/* used when calling require('htmlvalidate'); */

export * from "./browser";
export { CLI } from "./cli/cli";
export { FileSystemConfigLoader } from "./config/loaders/file-system";
export { Formatter, getFormatter as formatterFactory } from "./formatters";
export { compatibilityCheck, CompatibilityOptions } from "./utils";
