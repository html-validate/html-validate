import { stripAnsi } from "../../jest/utils";
import { ImportResolveMissingError } from "./import-resolve-missing-error";

expect.addSnapshotSerializer({
	serialize(value) {
		/* mask current version as it will differ */
		return stripAnsi(value.replace(/(Current:\s+)v[\d.]+/, "$1[..]"));
	},
	test(): boolean {
		return true;
	},
});

it("should format pretty error", () => {
	expect.assertions(1);
	const error = new ImportResolveMissingError();
	expect(error.prettyFormat()).toMatchInlineSnapshot(`
		Error: import.meta.resolve(..) is not available on this system.

		Either ensure you are running a supported NodeJS version:
		  Current:  [..]
		  Required: v18.19.0, v20.6.0, or later
		Or set NODE_OPTIONS="--experimental-import-meta-resolve"
	`);
});
