/**
 * @internal
 */
export function stripAnsi(text: string | false): string {
	if (!text) {
		return "";
	}
	/* eslint-disable-next-line no-control-regex -- expected to match control characters */
	return text.replace(/\u001B\[[0-9;]*m/g, "");
}
