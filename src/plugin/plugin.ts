import { ConfigData } from "../config";
import { RuleConstructor } from "../rule";

export interface SchemaValidationPatch {
	properties?: object;
	definitions?: object;
}

export interface Plugin {
	/**
	 * Name of the plugin.
	 *
	 * Read-only property set by config.
	 */
	name: string;

	/**
	 * Configuration presets.
	 *
	 * Each key should be the unprefixed name which a configuration later can
	 * access using `${plugin}:${key}`, e.g. if a plugin named "my-plugin" exposes
	 * a preset named "foobar" it can be accessed using `"extends":
	 * ["my-plugin:foobar"]`.
	 */
	configs: { [key: string]: ConfigData };

	rules: { [key: string]: RuleConstructor };

	/**
	 * Extend metadata validation schema.
	 */
	elementSchema?: SchemaValidationPatch;
}
