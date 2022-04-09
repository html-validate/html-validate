export function stripAnsi(text: string): string {
	/* eslint-disable-next-line no-control-regex */
	return text.replace(/\u001B\[[0-9;]*m/g, "");
}
