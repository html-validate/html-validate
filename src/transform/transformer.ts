import { type Source } from "../context";
import { type TransformContext } from "./context";

/**
 * @public
 */
export type Transformer = (this: TransformContext, source: Source) => Iterable<Source>;
