import { type HtmlValidate } from "../..";
import { type WritableStreamLike } from "../writable-stream-like";

export function printConfig(
	htmlvalidate: HtmlValidate,
	output: WritableStreamLike,
	files: string[]
): Promise<boolean> {
	if (files.length > 1) {
		output.write(`\`--print-config\` expected a single filename but got multiple:\n\n`);
		for (const filename of files) {
			output.write(`  - ${filename}\n`);
		}
		output.write("\n");
		return Promise.resolve(false);
	}
	const config = htmlvalidate.getConfigFor(files[0]);
	const json = JSON.stringify(config.getConfigData(), null, 2);
	output.write(`${json}\n`);
	return Promise.resolve(true);
}
