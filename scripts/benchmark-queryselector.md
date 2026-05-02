# benchmark-queryselector

Benchmarks the performance of `querySelector()` on parsed HTML documents.

Each scenario generates a document and then repeatedly calls `querySelector()` for 15 seconds, counting how many calls succeed per second.

## Running

Build the project first:

```sh
npm run build
```

Then run the script:

```sh
node scripts/benchmark-queryselector.mts
```

The script reports:

- **ops** - total number of `querySelector()` calls completed in the time window
- **ops/sec** - throughput (higher is better)

## Adding scenarios

Add an entry to the `scenarios` array using `defineScenario()`.

```ts
defineScenario({
    name: "my scenario",
    description: "Short description of the document structure and selector pattern.",

    // Called once before the benchmark loop. Build the document and any
    // lookup structures here. The return value is passed to every run() call.
    setup(parser) {
        const document = parser.parseHtml(`<div id="target"></div>`);
        return { document };
    },

    // Called in a tight loop for the duration of the benchmark.
    // rng() returns a deterministic pseudo-random number in range [0, 1).
    run(context, rng) {
		const { document } = context;
        const el = document.querySelector("#target");
        return { pass: el?.id === "target" };
    },
}),
```
