/**
 * This module will be overwritten by bundler during compilation. Make sure that
 * any changes to this file is present in the virtual module.
 */

import { pathToFileURL } from "node:url";

export const legacyRequire = require;
export const importResolve = (specifier: string): URL => {
	return pathToFileURL(require.resolve(specifier));
};
