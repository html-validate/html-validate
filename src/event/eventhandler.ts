/**
 * @public
 */
export type EventCallback = (event: string, data: any) => void;

/**
 * @public
 */
export class EventHandler {
	private listeners: Record<string, EventCallback[] | undefined>;

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
		const { listeners } = this;
		const names = event.split(",").map((it) => it.trim());
		for (const name of names) {
			const list = listeners[name] ?? [];
			listeners[name] = list;
			list.push(callback);
		}
		return () => {
			for (const name of names) {
				/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion --
				 * this is never unset here as we must have associated the name with an
				 * array earlier or we wouldn't have ended up here */
				const list = listeners[name]!;
				this.listeners[name] = list.filter((fn) => fn !== callback);
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
		const deregister = this.on(event, (event, data) => {
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
		for (const listener of this.getCallbacks(event)) {
			listener.call(null, event, data);
		}
	}

	private getCallbacks(event: string): EventCallback[] {
		const { listeners } = this;
		const callbacks = listeners[event] ?? [];
		const global = listeners["*"] ?? [];
		return [...callbacks, ...global];
	}
}

export default EventHandler;
