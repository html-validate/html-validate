import { UserError } from "../error";

/**
 * @internal
 */
export class ConfigError extends UserError {
	public constructor(message: string, nested?: Error) {
		super(message, nested);
		this.name = ConfigError.name;
	}
}
