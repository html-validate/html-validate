/**
 * @internal
 */
export type AnyFn<R = any, T extends any[] = any[]> = (...args: T) => R;

/**
 * @internal
 */
export type AnyAsyncFn<T = any> = AnyFn<Promise<T>>;

/**
 * @internal
 */
export type Syncify<T extends AnyAsyncFn> = T extends (...args: infer Args) => Promise<infer R>
	? (...args: Args) => R
	: never;

/**
 * @internal
 */
export interface MainToWorkerMessage<T extends unknown[]> {
	id: number;
	args: T;
}

/**
 * @internal
 */
export interface MainToWorkerCommandMessage {
	id: number;
	cmd: string;
}

/**
 * @internal
 */
export interface DataResult<T> {
	result: T;
}

/**
 * @internal
 */
export interface DataError {
	error: string;
}

/**
 * @internal
 */
export type DataMessage<T> = DataResult<T> | DataError;

/**
 * @internal
 */
export interface WorkerToMainResult<T = unknown> extends DataResult<T> {
	id: number;
}

/**
 * @internal
 */
export interface WorkerToMainError extends DataError {
	id: number;
}

/**
 * @internal
 */
export type WorkerToMainMessage<T> = WorkerToMainResult<T> | WorkerToMainError;
