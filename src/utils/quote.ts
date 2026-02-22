/**
 * Quote a value by wrapping it in the specified quote character.
 *
 * @internal
 * @param value - Value to quote
 * @param char - Quote character to use (default: double quote)
 * @returns Quoted value
 */
export function quote(value: string, char: string = '"'): string {
	return `${char}${value}${char}`;
}
