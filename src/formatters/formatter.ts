import { Result } from "../reporter";

export type Formatter = (results: Result[]) => string;
