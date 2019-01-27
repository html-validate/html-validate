import { Result } from "../reporter";

export type Formatter = (results: Result[]) => string;

export interface FormatterModule {
	exports: Formatter;
}
