import "./augmentation";

import { expect } from "vitest";
import {
	toBeInvalid,
	toBeValid,
	toHTMLValidate,
	toHaveError,
	toHaveErrors,
} from "../jest/matchers";

expect.extend({
	toBeValid: toBeValid(),
	toBeInvalid: toBeInvalid(),
	toHTMLValidate: toHTMLValidate(expect, undefined),
	toHaveError: toHaveError(expect, undefined),
	toHaveErrors: toHaveErrors(expect, undefined),
});
