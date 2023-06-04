/**
 * @public
 */
export interface FSLike {
	existsSync(path: string): boolean;
}
