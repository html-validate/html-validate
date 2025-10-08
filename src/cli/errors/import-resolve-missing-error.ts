import kleur from "kleur";
import { engines } from "../../../package.json";
import { UserError } from "../../error";

/**
 * @internal
 */
export class ImportResolveMissingError extends UserError {
	public constructor() {
		const message = `import.meta.resolve(..) is not available on this system`;
		super(message);
		Error.captureStackTrace(this, ImportResolveMissingError);
		this.name = ImportResolveMissingError.name;
	}

	public prettyFormat(): string {
		const { message } = this;
		const currentVersion = process.version;
		const requiredVersion = engines.node
			.split("||")
			.map((it) => `v${it.replace(/^[^\d]+/, "").trim()}`);
		return [
			kleur.red(`Error: ${message}.`),
			"",
			`Either ensure you are running a supported NodeJS version:`,
			`  Current:  ${currentVersion}`,
			`  Required: ${requiredVersion.join(", ")} or later`,
			`Or set NODE_OPTIONS="--experimental-import-meta-resolve"`,
		].join("\n");
	}
}
