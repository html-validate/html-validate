export function isThenable<T>(src: T | Promise<T>): src is Promise<T> {
	return src && typeof src === "object" && typeof (src as any).then === "function";
}
