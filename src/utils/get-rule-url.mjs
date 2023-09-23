import path from "path";
import { fileURLToPath } from "node:url";

/**
 * Returns a URL to the public website based on the filename. Do not call this
 * function directly, rather use the function from `src/rule.ts`:
 *
 * ```ts
 * import { ruleDocumentationUrl } from "../rule";
 *
 * const url = ruleDocumentationUrl(__filename);
 * ```
 *
 * This function is a bit special, during bundling it is called at compile time
 * and not during runtime. This is because it becomes difficult to determine the
 * original filename after bundling.
 *
 * @internal
 * @param {string} filename
 * @param {string} [homepage]
 * @returns {string}
 */
export function getRuleUrl(filename, homepage = "https://html-validate.org") {
	const parsed = path.parse(filename);
	const root = fileURLToPath(new URL("../rules", import.meta.url));
	const rel = path.relative(root, path.join(parsed.dir, parsed.name));
	const normalized = rel.replace(/\\/g, "/");
	return `${homepage}/rules/${normalized}.html`;
}
