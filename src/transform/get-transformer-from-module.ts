import { type Resolver, resolveTransformer } from "../config/resolver";
import { type Transformer } from "./transformer";

/**
 * @internal
 */
export function getTransformerFromModule(
	resolvers: Resolver[],
	name: string,
): Transformer | Promise<Transformer> {
	return resolveTransformer(resolvers, name, { cache: true });
}
