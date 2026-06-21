import { UserError } from "../error";

/**
 * @internal
 */
export class ConfigError extends UserError {
	/* eslint-disable-next-line unicorn/custom-error-definition -- technical debt */
	public constructor(message: string, nested?: Error) {
		super(message, nested);
		this.name = "ConfigError";
	}
}
