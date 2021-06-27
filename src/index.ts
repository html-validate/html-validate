/* used when calling require('htmlvalidate'); */

export * from "./browser";
export { Formatter, getFormatter as formatterFactory } from "./formatters";
export { CLI } from "./cli/cli";
export { compatibilityCheck, CompatibilityOptions } from "./utils";
