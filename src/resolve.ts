/**
 * This module will be overwritten by bundler during compilation. Make sure that
 * any changes to this file is present in the virtual module.
 */

import path from "path";

export const projectRoot = path.resolve(__dirname, "..");
export const distFolder = path.join(projectRoot, "src");
