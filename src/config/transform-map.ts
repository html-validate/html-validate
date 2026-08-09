import { type Transformer } from "../transform/transformer";

/**
 * @public
 */
export type TransformMap = Record<string, string | Transformer>;
