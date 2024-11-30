import { type Resolver, resolveTransformer } from "../config";
import { type Transformer } from "./transformer";

/**
 * @internal
 */
export function getTransformerFromModule(resolvers: Resolver[], name: string): Transformer {
	return resolveTransformer(resolvers, name, { cache: true });
}
