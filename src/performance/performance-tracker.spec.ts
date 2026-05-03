import { describe, expect, it } from "@jest/globals";
import { PerformanceTracker } from "./performance-tracker";

describe("PerformanceTracker", () => {
	describe("trackEvent", () => {
		it("should record a single event", () => {
			expect.assertions(1);
			const tracker = new PerformanceTracker();
			tracker.trackEvent("tag:start", 1.5);
			const result = tracker.getResult();
			expect(result.events).toEqual([{ event: "tag:start", count: 1, time: 1.5 }]);
		});

		it("should accumulate multiple firings of the same event", () => {
			expect.assertions(1);
			const tracker = new PerformanceTracker();
			tracker.trackEvent("tag:start", 1);
			tracker.trackEvent("tag:start", 2);
			const result = tracker.getResult();
			expect(result.events).toEqual([{ event: "tag:start", count: 2, time: 3 }]);
		});

		it("should track multiple distinct events", () => {
			expect.assertions(1);
			const tracker = new PerformanceTracker();
			tracker.trackEvent("tag:start", 1);
			tracker.trackEvent("attr", 0.5);
			const result = tracker.getResult();
			expect(result.events).toHaveLength(2);
		});
	});

	describe("trackRule", () => {
		it("should record a single rule invocation", () => {
			expect.assertions(1);
			const tracker = new PerformanceTracker();
			tracker.trackRule("aria-label", 0.8);
			const result = tracker.getResult();
			expect(result.rules).toEqual([{ rule: "aria-label", count: 1, time: 0.8 }]);
		});

		it("should accumulate multiple invocations of the same rule", () => {
			expect.assertions(1);
			const tracker = new PerformanceTracker();
			tracker.trackRule("aria-label", 0.3);
			tracker.trackRule("aria-label", 0.5);
			const result = tracker.getResult();
			expect(result.rules).toEqual([{ rule: "aria-label", count: 2, time: 0.8 }]);
		});

		it("should track multiple distinct rules", () => {
			expect.assertions(1);
			const tracker = new PerformanceTracker();
			tracker.trackRule("aria-label", 0.3);
			tracker.trackRule("role", 0.5);
			const result = tracker.getResult();
			expect(result.rules).toHaveLength(2);
		});
	});

	describe("getResult", () => {
		it("should sort events by time descending", () => {
			expect.assertions(1);
			const tracker = new PerformanceTracker();
			tracker.trackEvent("attr", 1);
			tracker.trackEvent("tag:start", 5);
			tracker.trackEvent("dom:ready", 2);
			const { events } = tracker.getResult();
			expect(events.map((e) => e.event)).toEqual(["tag:start", "dom:ready", "attr"]);
		});

		it("should sort rules by time descending", () => {
			expect.assertions(1);
			const tracker = new PerformanceTracker();
			tracker.trackRule("rule-b", 1);
			tracker.trackRule("rule-a", 5);
			tracker.trackRule("rule-c", 2);
			const { rules } = tracker.getResult();
			expect(rules.map((r) => r.rule)).toEqual(["rule-a", "rule-c", "rule-b"]);
		});

		it("should return empty arrays when nothing has been tracked", () => {
			expect.assertions(2);
			const tracker = new PerformanceTracker();
			const result = tracker.getResult();
			expect(result.events).toEqual([]);
			expect(result.rules).toEqual([]);
		});

		it("should not mutate internal state on repeated calls", () => {
			expect.assertions(2);
			const tracker = new PerformanceTracker();
			tracker.trackEvent("tag:start", 1);
			const first = tracker.getResult();
			tracker.trackEvent("tag:start", 1);
			const second = tracker.getResult();
			expect(first.events[0].count).toBe(1);
			expect(second.events[0].count).toBe(2);
		});
	});
});
