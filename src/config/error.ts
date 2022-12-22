import { UserError } from "../error";

/**
 * @public
 */
export class ConfigError extends UserError {
	public constructor(message: string, nested?: Error) {
		super(message, nested);
		Error.captureStackTrace(this, ConfigError);
		this.name = ConfigError.name;
	}
}
