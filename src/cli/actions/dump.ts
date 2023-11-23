import { type HtmlValidate, type TokenDump } from "../..";
import { eventFormatter } from "../json";
import { Mode } from "../mode";
import { type WritableStreamLike } from "../writable-stream-like";

export function dump(
	htmlvalidate: HtmlValidate,
	output: WritableStreamLike,
	files: string[],
	mode: Mode,
): Promise<boolean> {
	let lines: string[][] = [];
	switch (mode) {
		case Mode.DUMP_EVENTS:
			lines = files.map((filename: string) =>
				htmlvalidate.dumpEvents(filename).map(eventFormatter),
			);
			break;
		case Mode.DUMP_TOKENS:
			lines = files.map((filename: string) =>
				htmlvalidate.dumpTokens(filename).map((entry: TokenDump) => {
					const data = JSON.stringify(entry.data);
					return `TOKEN: ${entry.token}\n  Data: ${data}\n  Location: ${entry.location}`;
				}),
			);
			break;
		case Mode.DUMP_TREE:
			lines = files.map((filename: string) => htmlvalidate.dumpTree(filename));
			break;
		case Mode.DUMP_SOURCE:
			lines = files.map((filename: string) => htmlvalidate.dumpSource(filename));
			break;
		default:
			throw new Error(`Unknown mode "${mode}"`);
	}
	const flat = lines.reduce((s: string[], c: string[]) => s.concat(c), []);
	output.write(flat.join("\n"));
	output.write("\n");
	return Promise.resolve(true);
}
