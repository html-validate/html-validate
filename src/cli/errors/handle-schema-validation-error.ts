import fs from "node:fs";
import path from "node:path";
import betterAjvErrors from "@sidvind/better-ajv-errors";
import kleur from "kleur";
import { type SchemaValidationError } from "../../error";

function prettyError(err: SchemaValidationError): string {
	let json: string | undefined;
	if (err.filename && fs.existsSync(err.filename)) {
		json = fs.readFileSync(err.filename, "utf-8");
	}
	return betterAjvErrors(err.schema, err.obj, err.errors, {
		format: "cli",
		indent: 2,
		json,
	});
}

/**
 * @internal
 */
export function handleSchemaValidationError(console: Console, err: SchemaValidationError): void {
	if (err.filename) {
		const filename = path.relative(process.cwd(), err.filename);
		console.error(kleur.red(`A configuration error was found in "${filename}":`));
	} else {
		console.error(kleur.red(`A configuration error was found:`));
	}
	console.group();
	{
		console.error(prettyError(err));
	}
	console.groupEnd();
}
