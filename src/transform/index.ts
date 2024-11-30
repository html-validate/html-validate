export { type TransformContext } from "./context";
export { getTransformerFromModule } from "./get-transformer-from-module";
export { type Transformer } from "./transformer";

/**
 * @internal
 */
export const TRANSFORMER_API: { readonly VERSION: number } = {
	VERSION: 1,
};
