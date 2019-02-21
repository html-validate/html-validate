import { DynamicValue } from "../../dom";
import { processAttribute } from "./attribute";

describe("mock attribute processor", () => {
	it('should handle dynamic-foo="bar" as alias', () => {
		const attr = processAttribute({
			key: "dynamic-foo",
			value: "bar",
		});
		expect(attr).toEqual({
			key: "foo",
			value: expect.any(DynamicValue),
			originalAttribute: "dynamic-foo",
		});
		expect(attr.value).toEqual({
			expr: "bar",
		});
	});

	it('should handle foo="{{ bar }}" as interpolated value', () => {
		const attr = processAttribute({
			key: "foo",
			value: "{{ bar }}",
		});
		expect(attr).toEqual({
			key: "foo",
			value: expect.any(DynamicValue),
		});
		expect(attr.value).toEqual({
			expr: "{{ bar }}",
		});
	});

	it("should leave other attributes intact", () => {
		const attr = processAttribute({
			key: "foo",
			value: "bar",
		});
		expect(attr).toEqual({
			key: "foo",
			value: "bar",
		});
	});
});
