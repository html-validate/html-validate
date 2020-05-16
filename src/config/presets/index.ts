import { ConfigData } from "../config-data";
import recommended from "./recommended";
import document from "./document";

const presets: Record<string, ConfigData> = {
	"html-validate:recommended": recommended,
	"html-validate:document": document,

	/* @deprecated aliases */
	"htmlvalidate:recommended": recommended,
	"htmlvalidate:document": document,
};

export = presets;
