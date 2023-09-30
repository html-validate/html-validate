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

expect.extend({
	toBeValid: toBeValid(),
	toBeInvalid: toBeInvalid(),
	toHTMLValidate: toHTMLValidate(expect),
	toHaveError: toHaveError(expect),
	toHaveErrors: toHaveErrors(expect),
	toMatchCodeframe: toMatchCodeframe(),
	toMatchInlineCodeframe: toMatchInlineCodeframe(),
});
