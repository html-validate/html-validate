import { type Location } from "../context";
import { type EventDump } from "../engine";
import { eventFormatter, eventReplacer } from "./json";

const location: Location = {
	filename: "mock-filename.html",
	line: 1,
	column: 1,
	offset: 0,
	size: 1,
};

describe("eventReplacer", () => {
	it("should hide large and recursive properties", () => {
		expect.assertions(1);
		const obj = {
			parent: "recursive object",
			children: "recursive and large object",
			meta: "large object",
			foo: "bar",
			deep: {
				parent: "recursive object",
				spam: "ham",
			},
		};
		expect(JSON.stringify(obj, eventReplacer, 2)).toMatchSnapshot();
	});

	it("should reformat location", () => {
		expect.assertions(1);
		const obj = {
			location: {
				filename: "foo.html",
				line: 1,
				column: 2,
			},
			deep: {
				location: {
					filename: "bar.html",
					line: 3,
					column: 4,
				},
			},
		};
		expect(JSON.stringify(obj, eventReplacer, 2)).toMatchSnapshot();
	});
});

describe("eventFormatter", () => {
	it("should return formatted string", () => {
		expect.assertions(1);
		const entry: EventDump = {
			event: "foo",
			data: {
				foo: "bar",
				location: {
					filename: "foo.html",
					line: 1,
					column: 2,
					offset: 1,
				},
				parent: "recursive object",
			},
		};
		expect(eventFormatter(entry)).toMatchSnapshot();
	});

	it("should filter out any keys starting with underscore (internal properties)", () => {
		expect.assertions(1);
		const entry: EventDump = {
			event: "mock-event",
			data: {
				foo: 1,
				_bar: 2,
			},
		};
		expect(eventFormatter(entry)).toMatchInlineSnapshot(`
			"mock-event: {
			  "foo": 1
			}"
		`);
	});

	it("should condense locations", () => {
		expect.assertions(1);
		const entry: EventDump = {
			event: "mock-event",
			data: {
				location,
				otherLocation: location,
			},
		};
		expect(eventFormatter(entry)).toMatchInlineSnapshot(`
			"mock-event: {
			  "location": "mock-filename.html:1:1",
			  "otherLocation": "mock-filename.html:1:1"
			}"
		`);
	});
});
