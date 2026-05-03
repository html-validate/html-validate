/**
 * @internal
 */
export interface EventPerformanceEntry {
	event: string;
	count: number;
	/** Time in milliseconds */
	time: number;
}

/**
 * @internal
 */
export interface RulePerformanceEntry {
	rule: string;
	count: number;
	/** Time in milliseconds */
	time: number;
}

/**
 * @internal
 */
export interface PerformanceResult {
	events: EventPerformanceEntry[];
	rules: RulePerformanceEntry[];
	/** Total time spent loading configuration in milliseconds */
	configTime: number;
	/** Total time spent in transformers in milliseconds */
	transformTime: number;
	/** Total wall-clock time in milliseconds between start/stop */
	totalTime: number;
}

/**
 * Tracks performance data during validation (event counts/timings and rule counts/timings).
 *
 * @internal
 */
export class PerformanceTracker {
	private readonly eventData: Map<string, { count: number; time: number }>;
	private readonly ruleData: Map<string, { count: number; time: number }>;
	private readonly startTime: number;
	private accConfigTime: number;
	private accTransformTime: number;

	public constructor() {
		this.eventData = new Map();
		this.ruleData = new Map();
		this.startTime = performance.now();
		this.accConfigTime = 0;
		this.accTransformTime = 0;
	}

	/**
	 * Record a single event trigger with the time it took to run all listeners.
	 */
	public trackEvent(name: string, time: number): void {
		const existing = this.eventData.get(name);
		if (existing) {
			existing.count += 1;
			existing.time += time;
		} else {
			this.eventData.set(name, { count: 1, time });
		}
	}

	/**
	 * Record time spent loading configuration.
	 */
	public trackConfig(time: number): void {
		this.accConfigTime += time;
	}

	/**
	 * Record time spent in transformers.
	 */
	public trackTransform(time: number): void {
		this.accTransformTime += time;
	}

	/**
	 * Record a single rule callback invocation with its execution time.
	 */
	public trackRule(ruleName: string, time: number): void {
		const existing = this.ruleData.get(ruleName);
		if (existing) {
			existing.count += 1;
			existing.time += time;
		} else {
			this.ruleData.set(ruleName, { count: 1, time });
		}
	}

	/**
	 * Returns a snapshot of the recorded performance data, with both arrays
	 * sorted by time (descending).
	 */
	public getResult(): PerformanceResult {
		const events: EventPerformanceEntry[] = Array.from(
			this.eventData.entries(),
			([event, { count, time }]) => ({ event, count, time }),
		).toSorted((a, b) => b.time - a.time);

		const rules: RulePerformanceEntry[] = Array.from(
			this.ruleData.entries(),
			([rule, { count, time }]) => ({ rule, count, time }),
		).toSorted((a, b) => b.time - a.time);

		return {
			events,
			rules,
			configTime: this.accConfigTime,
			transformTime: this.accTransformTime,
			totalTime: performance.now() - this.startTime,
		};
	}
}
