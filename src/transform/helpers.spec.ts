import { offsetToLineColumn } from "./helpers";

describe("offsetToLineColumn() should calculate line and column from offset", () => {
	const data = "lorem\nipsum dolor\nsit amet";

	it.each`
		offset | line | column | character
		${0}   | ${1} | ${1}   | ${"l"}
		${1}   | ${1} | ${2}   | ${"o"}
		${5}   | ${1} | ${6}   | ${"\n"}
		${6}   | ${2} | ${1}   | ${"i"}
		${16}  | ${2} | ${11}  | ${"r"}
		${18}  | ${3} | ${1}   | ${"s"}
		${25}  | ${3} | ${8}   | ${"t"}
	`("Offset $offset should be $line:$column", ({ offset, line, column, character }) => {
		expect.assertions(2);
		expect(data[offset]).toEqual(character);
		expect(offsetToLineColumn(data, offset)).toEqual([line, column]);
	});
});
