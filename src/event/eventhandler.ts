/**
 * @public
 */
export type EventCallback = (event: string, data: any) => void;

/**
 * @public
 */
export class EventHandler {
	public listeners: Record<string, EventCallback[]>;

	public constructor() {
		this.listeners = {};
	}

	/**
	 * Add an event listener.
	 *
	 * @param event - Event names (comma separated) or '*' for any event.
	 * @param callback - Called any time even triggers.
	 * @returns Unregistration function.
	 */
	public on(event: string, callback: EventCallback): () => void {
		const names = event.split(",").map((x: string) => x.trim());
		for (const name of names) {
			this.listeners[name] = this.listeners[name] || [];
			this.listeners[name].push(callback);
		}
		return () => {
			for (const name of names) {
				this.listeners[name] = this.listeners[name].filter((fn: EventCallback) => {
					return fn !== callback;
				});
			}
		};
	}

	/**
	 * Add a onetime event listener. The listener will automatically be removed
	 * after being triggered once.
	 *
	 * @param event - Event names (comma separated) or '*' for any event.
	 * @param callback - Called any time even triggers.
	 * @returns Unregistration function.
	 */
	public once(event: string, callback: EventCallback): () => void {
		const deregister = this.on(event, (event: string, data: any) => {
			callback(event, data);
			deregister();
		});
		return deregister;
	}

	/**
	 * Trigger event causing all listeners to be called.
	 *
	 * @param event - Event name.
	 * @param data - Event data.
	 */
	public trigger(event: string, data: any): void {
		const callbacks = [...(this.listeners[event] ?? []), ...(this.listeners["*"] ?? [])];
		callbacks.forEach((listener) => {
			listener.call(null, event, data);
		});
	}
}

export default EventHandler;
