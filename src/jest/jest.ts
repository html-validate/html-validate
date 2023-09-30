import "./augmentation";

import {
	toBeValid,
	toBeInvalid,
	toHTMLValidate,
	toHaveError,
	toHaveErrors,
	toMatchCodeframe,
	toMatchInlineCodeframe,
} from "./matchers";
import { diff } from "./utils";

expect.extend({
	toBeValid: toBeValid(),
	toBeInvalid: toBeInvalid(),
	toHTMLValidate: toHTMLValidate(expect, diff),
	toHaveError: toHaveError(expect, diff),
	toHaveErrors: toHaveErrors(expect, diff),
	toMatchCodeframe: toMatchCodeframe(),
	toMatchInlineCodeframe: toMatchInlineCodeframe(),
});
