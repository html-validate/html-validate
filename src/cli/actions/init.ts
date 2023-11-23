import { type CLI } from "../cli";
import { type WritableStreamLike } from "../writable-stream-like";

export interface InitOptions {
	cwd: string;
}

export async function init(
	cli: CLI,
	output: WritableStreamLike,
	options: InitOptions,
): Promise<boolean> {
	const result = await cli.init(options.cwd);
	output.write(`Configuration written to "${result.filename}"\n`);
	return true;
}
