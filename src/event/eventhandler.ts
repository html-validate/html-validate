export type EventCallback = (event: string, data: any) => void;

export class EventHandler {
	listeners: { [event: string]: Array<EventCallback> };

	constructor(){
		this.listeners = {};
	}

	/**
	 * Add an event listener.
	 *
	 * @param event {string} - Event names (comma separated) or '*' for any event.
	 * @param callback {function} - Called any time even triggers.
	 * @return deregistration function.
	 */
	on(event: string, callback: EventCallback): () => void {
		const names = event.split(",").map((x: string) => x.trim());
		for (const name of names){
			this.listeners[name] = this.listeners[name] || [];
			this.listeners[name].push(callback);
		}
		return () => {
			for (const name of names){
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
	 * @param event {string} - Event names (comma separated) or '*' for any event.
	 * @param callback {function} - Called any time even triggers.
	 * @return deregistration function.
	 */
	once(event: string, callback: EventCallback): () => void {
		const deregister = this.on(event, (event: string, data: any) => {
			callback(event, data);
			deregister();
		});
		return deregister;
	}

	/**
	 * Trigger event causing all listeners to be called.
	 *
	 * @param event {string} - Event name.
	 * @param [data] {any} - Event data.
	 */
	trigger(event: string, data: any): void {
		const callbacks = [].concat(this.listeners[event] || [], this.listeners["*"] || []);
		callbacks.forEach(listener => {
			listener.call(null, event, data);
		});
	}
}

export default EventHandler;
