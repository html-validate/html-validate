export { type FSLike } from "./fs-like";
export {
	type CommonJSResolver,
	type NodeJSResolver, // eslint-disable-line @typescript-eslint/no-deprecated -- to be removed in next breaking
	cjsResolver,
	nodejsResolver, // eslint-disable-line @typescript-eslint/no-deprecated -- to be removed in next breaking
} from "./cjs-resolver";
export { type ESMResolver, esmResolver } from "./esm-resolver";
