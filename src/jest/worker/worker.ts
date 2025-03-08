import { type MessagePort, parentPort, workerData } from "node:worker_threads";
import { type ConfigData } from "../../config";
import { FileSystemConfigLoader } from "../../config/loaders/file-system";
import { HtmlValidate } from "../../htmlvalidate";
import { type Report } from "../../reporter";
import {
	type AnyAsyncFn,
	type MainToWorkerCommandMessage,
	type MainToWorkerMessage,
	type WorkerToMainMessage,
} from "./types";

interface WorkerData {
	sharedBuffer: SharedArrayBuffer;
	workerPort: MessagePort;
}

/* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- false positive, it is used in nested functions */
function runAsWorker<R = unknown, T extends AnyAsyncFn<R> = AnyAsyncFn<R>>(fn: T): void {
	if (!workerData) {
		return;
	}

	const { workerPort, sharedBuffer } = workerData as WorkerData;
	const sharedBufferView = new Int32Array(sharedBuffer, 0, 1);

	/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- better crash at runtime if not set */
	parentPort!.on("message", ({ id, args }: MainToWorkerMessage<Parameters<T>>) => {
		async function inner(): Promise<void> {
			let isAborted = false;
			const handleAbortMessage = (msg: MainToWorkerCommandMessage): void => {
				if (msg.id === id && msg.cmd === "abort") {
					isAborted = true;
				}
			};
			workerPort.on("message", handleAbortMessage);
			let msg: WorkerToMainMessage<R>;
			try {
				msg = { id, result: await fn(...args) };
			} catch (error: unknown) {
				msg = {
					id,
					error: error instanceof Error ? error.message : String(error),
				};
			}
			workerPort.off("message", handleAbortMessage);
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- modified by handleAbortMessage
			if (isAborted) {
				return;
			}
			workerPort.postMessage(msg);
			Atomics.add(sharedBufferView, 0, 1);
			Atomics.notify(sharedBufferView, 0);
		}
		// eslint-disable-next-line @typescript-eslint/no-floating-promises -- should not happen
		inner();
	});
}

function validateString(markup: string, filename: string, config: ConfigData): Promise<Report> {
	const loader = new FileSystemConfigLoader({
		extends: ["html-validate:recommended"],
	});
	const htmlvalidate = new HtmlValidate(loader);
	return htmlvalidate.validateString(markup, filename, config);
}

export type ValidateStringFn = typeof validateString;

runAsWorker(validateString);
