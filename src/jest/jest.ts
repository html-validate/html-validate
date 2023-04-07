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
	toBeValid,
	toBeInvalid,
	toHaveError,
	toHaveErrors,
	toHTMLValidate,
	toMatchCodeframe,
	toMatchInlineCodeframe,
});
