import {
	type MessagePort,
	MessageChannel,
	Worker,
	receiveMessageOnPort,
} from "node:worker_threads";
import { legacyRequire } from "../../resolve";
import {
	type AnyAsyncFn,
	type AnyFn,
	type MainToWorkerCommandMessage,
	type MainToWorkerMessage,
	type Syncify,
	type WorkerToMainError,
	type WorkerToMainMessage,
} from "./types";

/**
 * This is all based on the synckit library but without all the extra stuff such
 * as TypeScript, esbuld, pnpm etc.
 */

const INT32_BYTES = 4;
const syncFnCache = new Map<string, AnyFn>();
const sharedBuffer = new SharedArrayBuffer(INT32_BYTES);
const sharedBufferView = new Int32Array(sharedBuffer, 0, 1);

function isWorkerError<T>(value: WorkerToMainMessage<T>): value is WorkerToMainError {
	return "error" in value;
}

function receiveMessageWithId<R>(port: MessagePort, expectedId: number): WorkerToMainMessage<R> {
	/* wait for the semaphore to be raised before receiving message */
	const timeout = 30000;
	const status = Atomics.wait(sharedBufferView, 0, 0, timeout);
	Atomics.store(sharedBufferView, 0, 0);

	/* handle timeout or unexpected errors */
	if (!["ok", "not-equal"].includes(status)) {
		const abortMsg: MainToWorkerCommandMessage = {
			id: expectedId,
			cmd: "abort",
		};
		port.postMessage(abortMsg);
		throw new Error(`Internal error: Atomics.wait() failed: ${status}`);
	}

	/* the worker process will post the message before raising the semaphore, we
	 * should not reach this part of the code unless there is a message waiting to
	 * be read */
	const reply = receiveMessageOnPort(port) as { message: WorkerToMainMessage<R> };
	const { id, ...message } = reply.message;

	if (id < expectedId) {
		/* eslint-disable-next-line unicorn/no-useless-recursion -- technical debt */
		return receiveMessageWithId(port, expectedId);
	}

	if (expectedId !== id) {
		throw new Error(`Internal error: Expected id ${String(expectedId)} but got id ${String(id)}`);
	}

	return { id, ...message };
}

function startWorkerThread<R, T extends AnyAsyncFn<R>>(
	workerPath: string,
): (...args: Parameters<T>) => R {
	const { port1: mainPort, port2: workerPort } = new MessageChannel();
	const workerPathUrl = legacyRequire.resolve(workerPath);
	const worker = new Worker(workerPathUrl, {
		eval: false,
		workerData: { sharedBuffer, workerPort },
		transferList: [workerPort],
	});

	let nextID = 0;

	const syncFn = (...args: Parameters<T>): R => {
		const id = nextID++;
		const msg: MainToWorkerMessage<Parameters<T>> = { id, args };

		worker.postMessage(msg);

		const reply = receiveMessageWithId<R>(mainPort, id);

		if (isWorkerError(reply)) {
			throw new Error(reply.error);
		}

		return reply.result;
	};

	worker.unref();

	return syncFn;
}

export function createSyncFn<T extends AnyAsyncFn<R>, R = unknown>(workerPath: string): Syncify<T> {
	const cachedSyncFn = syncFnCache.get(workerPath);
	if (cachedSyncFn) {
		return cachedSyncFn as Syncify<T>;
	}

	const syncFn = startWorkerThread<R, T>(workerPath);
	syncFnCache.set(workerPath, syncFn);
	return syncFn as Syncify<T>;
}
