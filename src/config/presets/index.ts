import { ConfigData } from "../config-data";
import a17y from "./a17y";
import document from "./document";
import recommended from "./recommended";
import standard from "./standard";

/**
 * @internal
 */
const presets: Record<string, ConfigData> = {
	"html-validate:a17y": a17y,
	"html-validate:document": document,
	"html-validate:recommended": recommended,
	"html-validate:standard": standard,

	/* @deprecated aliases */
	"htmlvalidate:recommended": recommended,
	"htmlvalidate:document": document,
};

export default presets;
