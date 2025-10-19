import { UserError } from "./user-error";

/**
 * @internal
 */
export class InheritError extends UserError {
	private tagName: string;
	private inherit: string;
	public filename: string | null;

	public constructor({ tagName, inherit }: { tagName: string; inherit: string }) {
		const message = `Element <${tagName}> cannot inherit from <${inherit}>: no such element`;
		super(message);
		Error.captureStackTrace(this, InheritError);
		this.name = InheritError.name;
		this.tagName = tagName;
		this.inherit = inherit;
		this.filename = null;
	}

	public override prettyFormat(): string {
		const { message, tagName, inherit } = this;
		const source: string[] = this.filename
			? ["", "This error occurred when loading element metadata from:", `"${this.filename}"`, ""]
			: [""];
		return [
			message,
			...source,
			"This usually occurs when the elements are defined in the wrong order, try one of the following:",
			"",
			`  - Ensure the spelling of "${inherit}" is correct.`,
			`  - Ensure the file containing "${inherit}" is loaded before the file containing "${tagName}".`,
			`  - Move the definition of "${inherit}" above the definition for "${tagName}".`,
		].join("\n");
	}
}
