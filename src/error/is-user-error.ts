import { type UserError } from "./user-error";

/**
 * Returns `true` if the error is a `UserError`, i.e. it is an error thrown that
 * is caused by something the end user caused such as a misconfiguration.
 *
 * @public
 */
export function isUserError(error: unknown): error is UserError {
	return Boolean(error && typeof error === "object" && "isUserError" in error);
}
