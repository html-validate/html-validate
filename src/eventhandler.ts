'use strict';

type EventCallback = (event: string, data: any) => void;

class EventHandler {
	listeners: { [event: string]: Array<EventCallback> };

	constructor(){
		this.listeners = {};
	}

	/**
	 * Add an event listener.
	 *
	 * @param event {string} - Event name or '*' for any event.
	 * @param callback {function} - Called any time even triggers.
	 */
	on(event: string, callback: EventCallback){
		this.listeners[event] = this.listeners[event] || [];
		this.listeners[event].push(callback);
	}

	/**
	 * Trigger event causing all listeners to be called.
	 *
	 * @param event {string} - Event name.
	 * @param [data] {any} - Event data.
	 */
	trigger(event: string, data: any){
		const args = Array.prototype.slice.call(arguments, 1);
		const callbacks = [].concat(this.listeners[event] || [], this.listeners['*'] || []);
		callbacks.forEach(listener => {
			listener.apply(null, [event].concat(args));
		});
	}
}

export default EventHandler;
