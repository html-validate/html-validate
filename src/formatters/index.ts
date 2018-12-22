import { Result } from "../reporter"; /* eslint-disable-line no-unused-vars */

export type Formatter = (results: Result[]) => string;

export interface FormatterModule {
	exports: Formatter;
}
