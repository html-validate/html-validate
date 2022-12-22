import { InheritError } from "./inherit-error";

it("should format pretty error without filename", () => {
	expect.assertions(1);
	const error = new InheritError({
		tagName: "foo",
		inherit: "bar",
	});
	expect(error.prettyFormat()).toMatchInlineSnapshot(`
		"Element <foo> cannot inherit from <bar>: no such element

		This usually occurs when the elements are defined in the wrong order, try one of the following:

		  - Ensure the spelling of "bar" is correct.
		  - Ensure the file containing "bar" is loaded before the file containing "foo".
		  - Move the definition of "bar" above the definition for "foo"."
	`);
});

it("should format pretty error filename", () => {
	expect.assertions(1);
	const error = new InheritError({
		tagName: "foo",
		inherit: "bar",
	});
	error.filename = "/path/to/my-awesome-file.js";
	expect(error.prettyFormat()).toMatchInlineSnapshot(`
		"Element <foo> cannot inherit from <bar>: no such element

		This error occurred when loading element metadata from:
		"/path/to/my-awesome-file.js"

		This usually occurs when the elements are defined in the wrong order, try one of the following:

		  - Ensure the spelling of "bar" is correct.
		  - Ensure the file containing "bar" is loaded before the file containing "foo".
		  - Move the definition of "bar" above the definition for "foo"."
	`);
});
