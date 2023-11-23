import { DynamicValue } from "../../dom";
import { processAttribute } from "./attribute";

describe("mock attribute processor", () => {
	it('should handle dynamic-foo="bar" as alias', () => {
		expect.assertions(4);
		const attr = Array.from(
			processAttribute({
				key: "dynamic-foo",
				value: "bar",
				quote: null,
			}),
		);
		expect(attr).toHaveLength(2);
		expect(attr[0]).toEqual({
			key: "dynamic-foo",
			value: "bar",
			quote: null,
		});
		expect(attr[1]).toEqual({
			key: "foo",
			value: expect.any(DynamicValue),
			quote: null,
			originalAttribute: "dynamic-foo",
		});
		expect(attr[1].value).toEqual({
			expr: "bar",
		});
	});

	it('should handle foo="{{ bar }}" as interpolated value', () => {
		expect.assertions(3);
		const attr = Array.from(
			processAttribute({
				key: "foo",
				value: "{{ bar }}",
				quote: null,
			}),
		);
		expect(attr).toHaveLength(1);
		expect(attr[0]).toEqual({
			key: "foo",
			value: expect.any(DynamicValue),
			quote: null,
		});
		expect(attr[0].value).toEqual({
			expr: "{{ bar }}",
		});
	});

	it("should leave other attributes intact", () => {
		expect.assertions(2);
		const attr = Array.from(
			processAttribute({
				key: "foo",
				value: "bar",
				quote: null,
			}),
		);
		expect(attr).toHaveLength(1);
		expect(attr[0]).toEqual({
			key: "foo",
			value: "bar",
			quote: null,
		});
	});
});
