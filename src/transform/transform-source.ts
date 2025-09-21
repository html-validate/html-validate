import { type Source } from "../context";
import { type ResolvedConfig, type Resolver } from "../config";
import { ensureError, NestedError, UserError } from "../error";
import { isThenable } from "../utils";
import { type TransformContext } from "./context";
import { getCachedTransformerFunction } from "./get-transformer-function";

function isIterable<T>(value: unknown | Iterable<T>): value is Iterable<T> {
	return Boolean(value && typeof value === "object" && Symbol.iterator in value);
}

function toArray<T>(value: T | Iterable<T>): T[] {
	return isIterable(value) ? Array.from(value) : [value];
}

function isNonThenableArray<T>(value: Array<T | Promise<T>>): value is T[] {
	return !value.some(isThenable);
}

const asyncInSyncTransformError = "Cannot use async transformer from sync function";

/**
 * Transform a source.
 *
 * When transforming zero or more new sources will be generated.
 *
 * @internal
 * @param source - Current source to transform.
 * @param filename - If set it is the filename used to match
 * transformer. Default is to use filename from source.
 * @returns A list of transformed sources ready for validation.
 */
export async function transformSource(
	resolvers: Resolver[],
	config: ResolvedConfig,
	source: Source,
	filename?: string,
): Promise<Source[]> {
	const { cache } = config;
	const transformer = config.findTransformer(filename ?? source.filename);
	const context: TransformContext = {
		hasChain(filename) {
			return config.canTransform(filename);
		},
		chain(source, filename) {
			return transformSource(resolvers, config, source, filename);
		},
	};
	if (!transformer) {
		return Promise.resolve([source]);
	}
	const fn =
		transformer.kind === "import"
			? await getCachedTransformerFunction(cache, resolvers, transformer.name, config.getPlugins())
			: transformer.function;
	const name = transformer.kind === "import" ? transformer.name : transformer.function.name;
	try {
		const result = await fn.call(context, source);
		const transformedSources = await Promise.all(toArray(result)); // eslint-disable-line @typescript-eslint/await-thenable -- false positive
		for (const source of transformedSources) {
			/* keep track of which transformers that has been run on this source
			 * by appending this entry to the transformedBy array */
			source.transformedBy ??= [];
			source.transformedBy.push(name);
		}
		return transformedSources;
	} catch (err: unknown) {
		/* istanbul ignore next: only used as a fallback */
		const message = err instanceof Error ? err.message : String(err);
		throw new NestedError(`When transforming "${source.filename}": ${message}`, ensureError(err));
	}
}

/**
 * Transform a source.
 *
 * When transforming zero or more new sources will be generated.
 *
 * @internal
 * @param source - Current source to transform.
 * @param filename - If set it is the filename used to match
 * transformer. Default is to use filename from source.
 * @returns A list of transformed sources ready for validation.
 */
/* eslint-disable-next-line complexity -- there is many ifs'n buts here but hard
 * to break this down without loosing the little clarity that is still left */
export function transformSourceSync(
	resolvers: Resolver[],
	config: ResolvedConfig,
	source: Source,
	filename?: string,
): Source[] {
	const { cache } = config;
	const transformer = config.findTransformer(filename ?? source.filename);
	const context: TransformContext = {
		hasChain(filename) {
			return config.canTransform(filename);
		},
		chain(source, filename) {
			return transformSourceSync(resolvers, config, source, filename);
		},
	};
	if (!transformer) {
		return [source];
	}
	const fn =
		transformer.kind === "import"
			? getCachedTransformerFunction(cache, resolvers, transformer.name, config.getPlugins())
			: transformer.function;
	const name = transformer.kind === "import" ? transformer.name : transformer.function.name;
	if (isThenable(fn)) {
		throw new UserError(asyncInSyncTransformError);
	}
	try {
		const result = fn.call(context, source);
		if (isThenable(result)) {
			throw new UserError(asyncInSyncTransformError);
		}
		const transformedSources = toArray(result);
		if (!isNonThenableArray(transformedSources)) {
			throw new UserError(asyncInSyncTransformError);
		}
		for (const source of transformedSources) {
			/* keep track of which transformers that has been run on this source
			 * by appending this entry to the transformedBy array */
			source.transformedBy ??= [];
			source.transformedBy.push(name);
		}
		return transformedSources;
	} catch (err: unknown) {
		/* istanbul ignore next: only used as a fallback */
		const message = err instanceof Error ? err.message : String(err);
		throw new NestedError(`When transforming "${source.filename}": ${message}`, ensureError(err));
	}
}
