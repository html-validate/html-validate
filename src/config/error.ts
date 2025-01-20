import { UserError } from "../error";

/**
 * @internal
 */
export class ConfigError extends UserError {
	public constructor(message: string, nested?: Error) {
		super(message, nested);
		Error.captureStackTrace(this, ConfigError);
		this.name = ConfigError.name;
	}
}
