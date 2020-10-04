import stripAnsi = require("strip-ansi");
import { MetaElement } from "../meta/element";
import { MetaTable } from "../meta/table";
import { SchemaValidationError } from "./schema-validation-error";

it("SchemaValidationError should pretty-print validation errors", () => {
	expect.assertions(1);
	const table = new MetaTable();
	try {
		table.loadFromObject({
			foo: ({
				flow: "spam",
			} as unknown) as MetaElement,
		});
	} catch (err) {
		if (err instanceof SchemaValidationError) {
			const output = (err.prettyError() as unknown) as string;

			/* cannot test prettyError() method with builtin helpers */
			/* eslint-disable-next-line jest/no-try-expect, jest/no-conditional-expect */
			expect(stripAnsi(output)).toMatchSnapshot();
		}
	}
});
