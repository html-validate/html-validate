import { Source } from "../context";
import { TransformContext } from "./context";

export { TransformContext } from "./context";

export type Transformer = (this: TransformContext, source: Source) => Source[];
