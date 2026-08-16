import { describe, expect, it } from "@jest/globals";
import { assertValidLocation } from "./assert-valid-location";
import { type Location } from "./location";

function createLocation(location: Partial<Location> = {}): Location {
	return {
		filename: "-",
		offset: 0,
		line: 1,
		column: 1,
		size: 4,
		...location,
	};
}

describe("assertValidLocation()", () => {
	it("should not throw when length is given and location is in range", () => {
		expect.assertions(1);
		const location = createLocation({ offset: 2, size: 2 });
		expect(() => {
			assertValidLocation(location, 10);
		}).not.toThrow();
	});

	it("should throw when offset is not an integer", () => {
		expect.assertions(1);
		const location = createLocation({ offset: 1.5 });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location offset must be a positive integer but got 1.5");
	});

	it("should throw when offset is negative", () => {
		expect.assertions(1);
		const location = createLocation({ offset: -1 });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location offset must be a positive integer but got -1");
	});

	it("should throw when offset is NaN", () => {
		expect.assertions(1);
		const location = createLocation({ offset: NaN });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location offset must be a positive integer but got NaN");
	});

	it("should throw when offset is Infinity", () => {
		expect.assertions(1);
		const location = createLocation({ offset: Infinity });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location offset must be a positive integer but got Infinity");
	});

	it("should throw when offset exceeds Number.MAX_SAFE_INTEGER", () => {
		expect.assertions(1);
		const offset = Number.MAX_SAFE_INTEGER + 1;
		const location = createLocation({ offset });
		expect(() => {
			assertValidLocation(location);
		}).toThrow(`Location offset must be a positive integer but got ${offset}`);
	});

	it("should throw when line is not an integer", () => {
		expect.assertions(1);
		const location = createLocation({ line: 1.5 });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location line must be a positive integer but got 1.5");
	});

	it("should throw when line is zero", () => {
		expect.assertions(1);
		const location = createLocation({ line: 0 });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location line must be a positive integer but got 0");
	});

	it("should throw when line is negative", () => {
		expect.assertions(1);
		const location = createLocation({ line: -1 });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location line must be a positive integer but got -1");
	});

	it("should throw when line is NaN", () => {
		expect.assertions(1);
		const location = createLocation({ line: NaN });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location line must be a positive integer but got NaN");
	});

	it("should throw when line is Infinity", () => {
		expect.assertions(1);
		const location = createLocation({ line: Infinity });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location line must be a positive integer but got Infinity");
	});

	it("should throw when line exceeds Number.MAX_SAFE_INTEGER", () => {
		expect.assertions(1);
		const line = Number.MAX_SAFE_INTEGER + 1;
		const location = createLocation({ line });
		expect(() => {
			assertValidLocation(location);
		}).toThrow(`Location line must be a positive integer but got ${line}`);
	});

	it("should throw when column is not an integer", () => {
		expect.assertions(1);
		const location = createLocation({ column: 1.5 });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location column must be a positive integer but got 1.5");
	});

	it("should throw when column is zero", () => {
		expect.assertions(1);
		const location = createLocation({ column: 0 });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location column must be a positive integer but got 0");
	});

	it("should throw when column is negative", () => {
		expect.assertions(1);
		const location = createLocation({ column: -1 });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location column must be a positive integer but got -1");
	});

	it("should throw when column is NaN", () => {
		expect.assertions(1);
		const location = createLocation({ column: NaN });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location column must be a positive integer but got NaN");
	});

	it("should throw when column is Infinity", () => {
		expect.assertions(1);
		const location = createLocation({ column: Infinity });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location column must be a positive integer but got Infinity");
	});

	it("should throw when column exceeds Number.MAX_SAFE_INTEGER", () => {
		expect.assertions(1);
		const column = Number.MAX_SAFE_INTEGER + 1;
		const location = createLocation({ column });
		expect(() => {
			assertValidLocation(location);
		}).toThrow(`Location column must be a positive integer but got ${column}`);
	});

	it("should throw when size is not an integer", () => {
		expect.assertions(1);
		const location = createLocation({ size: 1.5 });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location size must be a positive integer but got 1.5");
	});

	it("should throw when size is negative", () => {
		expect.assertions(1);
		const location = createLocation({ size: -1 });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location size must be a positive integer but got -1");
	});

	it("should throw when size is NaN", () => {
		expect.assertions(1);
		const location = createLocation({ size: NaN });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location size must be a positive integer but got NaN");
	});

	it("should throw when size is Infinity", () => {
		expect.assertions(1);
		const location = createLocation({ size: Infinity });
		expect(() => {
			assertValidLocation(location);
		}).toThrow("Location size must be a positive integer but got Infinity");
	});

	it("should throw when size exceeds Number.MAX_SAFE_INTEGER", () => {
		expect.assertions(1);
		const size = Number.MAX_SAFE_INTEGER + 1;
		const location = createLocation({ size });
		expect(() => {
			assertValidLocation(location);
		}).toThrow(`Location size must be a positive integer but got ${size}`);
	});

	it("should throw when offset is not smaller than length", () => {
		expect.assertions(1);
		const location = createLocation({ offset: 10, size: 0 });
		expect(() => {
			assertValidLocation(location, 10);
		}).toThrow("Location offset 10 must be smaller than length 10");
	});

	it("should not throw when offset + size equals length", () => {
		expect.assertions(1);
		const location = createLocation({ offset: 0, size: 10 });
		expect(() => {
			assertValidLocation(location, 10);
		}).not.toThrow();
	});

	it("should throw when offset + size is greater than length", () => {
		expect.assertions(1);
		const location = createLocation({ offset: 0, size: 11 });
		expect(() => {
			assertValidLocation(location, 10);
		}).toThrow("Location offset + size 11 must be smaller than length 10");
	});
});
