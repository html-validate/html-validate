import { type HtmlValidate, type TokenDump } from "../..";
import { eventFormatter } from "../json";
import { Mode } from "../mode";
import { type WritableStreamLike } from "../writable-stream-like";

export async function dump(
	htmlvalidate: HtmlValidate,
	output: WritableStreamLike,
	files: string[],
	mode: Mode,
): Promise<boolean> {
	let lines: Array<Promise<string[]>>;
	switch (mode) {
		case Mode.DUMP_EVENTS:
			lines = files.map(async (filename: string) => {
				const lines = await htmlvalidate.dumpEvents(filename);
				return lines.map(eventFormatter);
			});
			break;
		case Mode.DUMP_TOKENS:
			lines = files.map(async (filename: string) => {
				const lines = await htmlvalidate.dumpTokens(filename);
				return lines.map((entry: TokenDump) => {
					const data = JSON.stringify(entry.data);
					return `TOKEN: ${entry.token}\n  Data: ${data}\n  Location: ${entry.location}`;
				});
			});
			break;
		case Mode.DUMP_TREE:
			lines = files.map((filename: string) => htmlvalidate.dumpTree(filename));
			break;
		case Mode.DUMP_SOURCE:
			lines = files.map((filename: string) => htmlvalidate.dumpSource(filename));
			break;
		default:
			throw new Error(`Unknown mode "${String(mode)}"`);
	}
	const flat = (await Promise.all(lines)).reduce((s: string[], c: string[]) => s.concat(c), []);
	output.write(flat.join("\n"));
	output.write("\n");
	return Promise.resolve(true);
}
