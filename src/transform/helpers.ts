/**
 * Given an offset into a source, calculate the corresponding line and column.
 */
export function offsetToLineColumn(data: string, offset: number): [number, number] {
	let line = 1;
	let prev = 0;
	let pos = data.indexOf("\n");

	/* step one line at a time until newline position is beyond wanted offset */
	while (pos !== -1) {
		if (pos >= offset) {
			return [line, offset - prev + 1];
		}
		line++;
		prev = pos + 1;
		pos = data.indexOf("\n", pos + 1);
	}

	/* missing final newline */
	return [line, offset - prev + 1];
}
