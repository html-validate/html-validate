/* entrypoint for nodejs build */

export * from "./common";
export { HtmlValidate } from "./htmlvalidate.nodejs";
export {
	type FileSystemConfigLoaderOptions,
	FileSystemConfigLoader,
} from "./config/loaders/file-system";
export {
	type FSLike,
	type CommonJSResolver,
	type ESMResolver,
	type NodeJSResolver,
	cjsResolver,
	esmResolver,
	nodejsResolver,
} from "./config/resolver/nodejs";
export {
	type AvailableFormatters,
	type Formatter,
	getFormatter as formatterFactory,
} from "./formatters";
export { compatibilityCheck } from "./utils/compatibility-check.nodejs";

/* this should be last to break import recursion from src/cli/cli.ts -> src/config/resolvers */
export { type CLIOptions, type ExpandOptions, type InitResult, CLI } from "./cli";
