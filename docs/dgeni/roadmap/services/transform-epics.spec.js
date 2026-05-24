import { describe, expect, it } from "@jest/globals";
import {
	extractExcerpt,
	filterHiddenEpics,
	sortChildren,
	sortEpics,
	transformEpic,
} from "./transform-epics.mjs";

describe("extractExcerpt", () => {
	it("should return the first paragraph", () => {
		expect.assertions(1);
		expect(extractExcerpt("First paragraph.\n\nSecond paragraph.")).toBe("First paragraph.");
	});

	it("should skip leading blank content and return the first non-empty paragraph", () => {
		expect.assertions(1);
		expect(extractExcerpt("\n\nActual content.\n\nMore content.")).toBe("Actual content.");
	});

	it("should trim surrounding whitespace from the result", () => {
		expect.assertions(1);
		expect(extractExcerpt("  hello  ")).toBe("hello");
	});

	it("should return an empty string for an empty description", () => {
		expect.assertions(1);
		expect(extractExcerpt("")).toBe("");
	});

	it("should preserve line breaks within a paragraph", () => {
		expect.assertions(1);
		expect(extractExcerpt("Line one\nLine two\n\nSecond paragraph.")).toBe("Line one\nLine two");
	});
});

describe("sortChildren", () => {
	it("should sort open children before closed", () => {
		expect.assertions(1);
		const children = [
			{ iid: "1", state: "CLOSED" },
			{ iid: "2", state: "OPEN" },
			{ iid: "3", state: "CLOSED" },
		];
		expect(sortChildren(children).map((c) => c.iid)).toEqual(["2", "1", "3"]);
	});

	it("should return all children (not filter any out)", () => {
		expect.assertions(1);
		expect(sortChildren([{ iid: "1", state: "CLOSED" }])).toHaveLength(1);
	});

	it("should return an empty array for empty input", () => {
		expect.assertions(1);
		expect(sortChildren([])).toEqual([]);
	});
});

describe("filterHiddenEpics", () => {
	it("should remove epics with docs::hidden label", () => {
		expect.assertions(1);
		const epics = [
			{ iid: "1", labels: [{ prefix: "docs", suffix: "hidden" }] },
			{ iid: "2", labels: [{ prefix: null, suffix: null }] },
		];
		expect(filterHiddenEpics(epics).map((e) => e.iid)).toEqual(["2"]);
	});

	it("should keep epics without docs::hidden label", () => {
		expect.assertions(1);
		const epics = [
			{ iid: "1", labels: [{ prefix: "component", suffix: "parser" }] },
			{ iid: "2", labels: [] },
		];
		expect(filterHiddenEpics(epics)).toHaveLength(2);
	});
});

describe("sortEpics", () => {
	it("should sort by weight ascending", () => {
		expect.assertions(1);
		const epics = [
			{ iid: "3", weight: 3 },
			{ iid: "1", weight: 1 },
			{ iid: "2", weight: 2 },
		];
		expect(sortEpics(epics).map((e) => e.iid)).toEqual(["1", "2", "3"]);
	});

	it("should place nulls after weighted epics", () => {
		expect.assertions(1);
		const epics = [
			{ iid: "1", weight: null },
			{ iid: "2", weight: 1 },
			{ iid: "3", weight: null },
		];
		expect(sortEpics(epics).map((e) => e.iid)).toEqual(["2", "1", "3"]);
	});

	it("should break ties by iid when weights are equal", () => {
		expect.assertions(1);
		const epics = [
			{ iid: "5", weight: 1 },
			{ iid: "2", weight: 1 },
		];
		expect(sortEpics(epics).map((e) => e.iid)).toEqual(["2", "5"]);
	});

	it("should sort nulls among themselves by iid", () => {
		expect.assertions(1);
		const epics = [
			{ iid: "5", weight: null },
			{ iid: "2", weight: null },
		];
		expect(sortEpics(epics).map((e) => e.iid)).toEqual(["2", "5"]);
	});

	it("should not mutate the input array", () => {
		expect.assertions(1);
		const epics = [
			{ iid: "2", weight: null },
			{ iid: "1", weight: null },
		];
		const original = Array.from(epics);
		sortEpics(epics);
		expect(epics).toEqual(original);
	});
});

describe("transformEpic", () => {
	function buildNode(overrides = {}) {
		return {
			iid: "1",
			title: "Test Epic",
			description: "First paragraph.\n\nSecond paragraph.",
			state: "OPEN",
			webUrl: "https://gitlab.com/groups/html-validate/-/epics/1",
			widgets: [],
			...overrides,
		};
	}

	it("should map basic fields", () => {
		expect.assertions(1);
		expect(transformEpic(buildNode())).toMatchObject({
			iid: "1",
			title: "Test Epic",
			description: "First paragraph.\n\nSecond paragraph.",
			webUrl: "https://gitlab.com/groups/html-validate/-/epics/1",
		});
	});

	it("should compute excerpt from description", () => {
		expect.assertions(1);
		expect(transformEpic(buildNode()).excerpt).toBe("First paragraph.");
	});

	it("should use default color when color widget is absent", () => {
		expect.assertions(2);
		const epic = transformEpic(buildNode());
		expect(epic.color).toBe("#1068bf");
		expect(epic.textColor).toBe("#FFFFFF");
	});

	it("should extract color from WorkItemWidgetColor", () => {
		expect.assertions(2);
		const node = buildNode({
			widgets: [{ __typename: "WorkItemWidgetColor", color: "#de198f", textColor: "#FFFFFF" }],
		});
		const epic = transformEpic(node);
		expect(epic.color).toBe("#de198f");
		expect(epic.textColor).toBe("#FFFFFF");
	});

	it("should extract weight from WorkItemWidgetWeight", () => {
		expect.assertions(1);
		const node = buildNode({
			widgets: [{ __typename: "WorkItemWidgetWeight", weight: 5 }],
		});
		expect(transformEpic(node).weight).toBe(5);
	});

	it("should default weight to null when widget is absent", () => {
		expect.assertions(1);
		expect(transformEpic(buildNode()).weight).toBeNull();
	});

	it("should extract due date from WorkItemWidgetStartAndDueDate", () => {
		expect.assertions(1);
		const node = buildNode({
			widgets: [{ __typename: "WorkItemWidgetStartAndDueDate", dueDate: "2026-12-31" }],
		});
		expect(transformEpic(node).dueDate).toBe("2026-12-31");
	});

	it("should default dueDate to null when widget is absent", () => {
		expect.assertions(1);
		expect(transformEpic(buildNode()).dueDate).toBeNull();
	});

	it("should extract labels from WorkItemWidgetLabels", () => {
		expect.assertions(1);
		const node = buildNode({
			widgets: [
				{
					__typename: "WorkItemWidgetLabels",
					labels: {
						nodes: [{ title: "help wanted", color: "#428BCA", textColor: "#FFFFFF" }],
					},
				},
			],
		});
		expect(transformEpic(node).labels).toEqual([
			{
				title: "help wanted",
				prefix: null,
				suffix: null,
				color: "#428BCA",
				textColor: "#FFFFFF",
			},
		]);
	});

	it("should extract prefix and suffix from scoped labels", () => {
		expect.assertions(1);
		const node = buildNode({
			widgets: [
				{
					__typename: "WorkItemWidgetLabels",
					labels: {
						nodes: [{ title: "component::parser", color: "#428BCA", textColor: "#FFFFFF" }],
					},
				},
			],
		});
		expect(transformEpic(node).labels).toEqual([
			{
				title: "component::parser",
				prefix: "component",
				suffix: "parser",
				color: "#428BCA",
				textColor: "#FFFFFF",
			},
		]);
	});

	it("should default labels to empty array when widget is absent", () => {
		expect.assertions(1);
		expect(transformEpic(buildNode()).labels).toEqual([]);
	});

	it("should sort children open-first from WorkItemWidgetHierarchy", () => {
		expect.assertions(2);
		const node = buildNode({
			widgets: [
				{
					__typename: "WorkItemWidgetHierarchy",
					children: {
						nodes: [
							{
								iid: "11",
								title: "Closed issue",
								state: "CLOSED",
								webUrl: "http://example.com/11",
							},
							{ iid: "10", title: "Open issue", state: "OPEN", webUrl: "http://example.com/10" },
						],
					},
				},
			],
		});
		const epic = transformEpic(node);
		expect(epic.children).toHaveLength(2);
		expect(epic.children[0].iid).toBe("10");
	});

	it("should default children to empty array when hierarchy widget is absent", () => {
		expect.assertions(1);
		expect(transformEpic(buildNode()).children).toEqual([]);
	});
});
