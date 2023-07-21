import kleur from "kleur";
import { compatibilityCheckImpl } from "./compatibility-check";

kleur.enabled = false;

const logger = (message: string): void => {
	/* eslint-disable-next-line no-console -- expected to log */
	console.error(message);
};
const log = jest.spyOn(console, "error").mockImplementation(() => undefined);
const peerDependency = ">= 2.1 || ^3.0";

beforeEach(() => {
	log.mockClear();
});

it("should warn when using unsupported html-validate version", () => {
	expect.assertions(2);
	compatibilityCheckImpl("my-plugin", peerDependency, { version: "1.2.3", silent: false, logger });
	expect(log).toHaveBeenCalled();
	expect(log.mock.calls[0][0]).toMatchInlineSnapshot(`
		"-----------------------------------------------------------------------------------------------------
		my-plugin requires html-validate version ">= 2.1 || ^3.0" but current installed version is 1.2.3
		This is not a supported configuration. Please install a supported version before reporting bugs.
		-----------------------------------------------------------------------------------------------------"
	`);
});

it("should not warn when using silent option", () => {
	expect.assertions(1);
	compatibilityCheckImpl("my-plugin", peerDependency, { version: "1.2.3", silent: true, logger });
	expect(log).not.toHaveBeenCalled();
});

it("should not warn when using supported html-validate version", () => {
	expect.assertions(1);
	compatibilityCheckImpl("my-plugin", peerDependency, { version: "2.1.0", silent: false, logger });
	compatibilityCheckImpl("my-plugin", peerDependency, { version: "2.2.0", silent: false, logger });
	compatibilityCheckImpl("my-plugin", peerDependency, { version: "3.0.0", silent: false, logger });
	expect(log).not.toHaveBeenCalled();
});

it("should use custom callback", () => {
	expect.assertions(2);
	const spy = jest.fn();
	compatibilityCheckImpl("my-plugin", peerDependency, {
		version: "1.2.3",
		silent: false,
		logger: spy,
	});
	expect(spy).toHaveBeenCalledWith(expect.stringContaining("my-plugin requires"));
	expect(log).not.toHaveBeenCalled();
});

it("should return true if version is supported", () => {
	expect.assertions(2);
	const result = compatibilityCheckImpl("my-plugin", peerDependency, {
		version: "2.1.0",
		silent: true,
		logger,
	});
	expect(log).not.toHaveBeenCalled();
	expect(result).toBeTruthy();
});

it("should return false if version is not supported", () => {
	expect.assertions(2);
	const result = compatibilityCheckImpl("my-plugin", peerDependency, {
		version: "2.0.0",
		silent: true,
		logger,
	});
	expect(log).not.toHaveBeenCalled();
	expect(result).toBeFalsy();
});
