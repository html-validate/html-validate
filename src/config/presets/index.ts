import { type ConfigData } from "../config-data";
import a11y from "./a11y";
import browser from "./browser";
import document from "./document";
import prettier from "./prettier";
import recommended from "./recommended";
import standard from "./standard";

/**
 * @internal
 */
const presets: Record<string, ConfigData> = {
	"html-validate:a11y": a11y,

	"html-validate:browser": browser,
	"html-validate:document": document,
	"html-validate:prettier": prettier,
	"html-validate:recommended": recommended,
	"html-validate:standard": standard,
};

export default presets;
