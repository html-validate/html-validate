/* entrypoint for browser build */

export * from "./common";
export { type ESMResolver, esmResolver } from "./config/resolver/browser";
export { compatibilityCheck } from "./utils/compatibility-check.browser";
