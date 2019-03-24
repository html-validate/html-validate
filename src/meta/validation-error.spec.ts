import stripAnsi from "strip-ansi";
import { MetaElement } from "./element";
import { MetaTable } from "./table";
import { MetaValidationError } from "./validation-error";

it("MetaValidationError should pretty-print validation errors ", () => {
	expect.assertions(1);
	const table = new MetaTable();
	try {
		table.loadFromObject({
			foo: ({
				flow: "spam",
			} as unknown) as MetaElement,
		});
	} catch (err) {
		if (err instanceof MetaValidationError) {
			const output = (err.prettyError() as unknown) as string;
			expect(stripAnsi(output)).toMatchSnapshot();
		}
	}
});
