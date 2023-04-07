import { type Result } from "../reporter";

/**
 * @public
 */
export type Formatter = (results: Result[]) => string;
