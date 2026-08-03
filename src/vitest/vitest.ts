import "./augmentation";

import { expect } from "vitest";
import {
	toBeInvalid,
	toBeValid,
	toHTMLValidate,
	toHaveError,
	toHaveErrors,
	toMatchCodeframe,
	toMatchInlineCodeframe,
} from "./matchers";

expect.extend({
	toBeValid: toBeValid(),
	toBeInvalid: toBeInvalid(),
	toHTMLValidate: toHTMLValidate(expect),
	/* @ts-expect-error technical debt, vitest/jest types clashes */
	toHaveError: toHaveError(expect),
	toHaveErrors: toHaveErrors(expect),
	toMatchCodeframe: toMatchCodeframe(),
	toMatchInlineCodeframe: toMatchInlineCodeframe(),
});
