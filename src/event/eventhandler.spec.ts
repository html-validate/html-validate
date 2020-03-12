import { EventHandler } from "./eventhandler";

describe("eventhandler", () => {
	let eventhandler: EventHandler;

	beforeEach(() => {
		eventhandler = new EventHandler();
	});

	describe("on", () => {
		it("should call listener on named event", () => {
			expect.assertions(3);
			const callback = jest.fn();
			eventhandler.on("foo", callback);
			eventhandler.trigger("foo", { bar: true });
			eventhandler.trigger("foo", { bar: false });
			expect(callback).toHaveBeenCalledTimes(2);
			expect(callback).toHaveBeenCalledWith("foo", { bar: true });
			expect(callback).toHaveBeenCalledWith("foo", { bar: false });
		});

		it("should not call listener on other events", () => {
			expect.assertions(1);
			const callback = jest.fn();
			eventhandler.on("foo", callback);
			eventhandler.trigger("spam", { bar: true });
			expect(callback).not.toHaveBeenCalled();
		});

		it("should call wildcard listener on any event", () => {
			expect.assertions(2);
			const callback = jest.fn();
			eventhandler.on("*", callback);
			eventhandler.trigger("foo", { bar: true });
			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenCalledWith("foo", { bar: true });
		});

		it("should not call listener after deregistration", () => {
			expect.assertions(1);
			const callback = jest.fn();
			const deregister = eventhandler.on("foo", callback);
			deregister();
			eventhandler.trigger("foo", { bar: true });
			expect(callback).not.toHaveBeenCalled();
		});

		it("should handle multiple events separated by comma", () => {
			expect.assertions(3);
			const callback = jest.fn();
			eventhandler.on("foo, bar", callback);
			eventhandler.trigger("foo", { bar: 1 });
			eventhandler.trigger("bar", { bar: 2 });
			expect(callback).toHaveBeenCalledTimes(2);
			expect(callback).toHaveBeenCalledWith("foo", { bar: 1 });
			expect(callback).toHaveBeenCalledWith("bar", { bar: 2 });
		});

		it("should unregister all events after using multiple space separated events", () => {
			expect.assertions(1);
			const callback = jest.fn();
			const deregister = eventhandler.on("foo,bar", callback);
			deregister();
			eventhandler.trigger("foo", {});
			eventhandler.trigger("bar", {});
			expect(callback).not.toHaveBeenCalled();
		});
	});

	describe("once", () => {
		it("should call listener only once", () => {
			expect.assertions(2);
			const callback = jest.fn();
			eventhandler.once("foo", callback);
			eventhandler.trigger("foo", { bar: true });
			eventhandler.trigger("foo", { bar: false });
			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenCalledWith("foo", { bar: true });
		});

		it("should not call listener after deregistration", () => {
			expect.assertions(1);
			const callback = jest.fn();
			const deregister = eventhandler.once("foo", callback);
			deregister();
			eventhandler.trigger("foo", { bar: true });
			expect(callback).not.toHaveBeenCalled();
		});
	});
});
