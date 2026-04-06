declare module "cypress" {
	interface Config {
		e2e: {
			/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- we dont have the actual types and this is only used for documentation examples */
			setupNodeEvents(on: (action: "task", arg: Record<string, (value: any) => any>) => void): void;
		};
	}

	export function defineConfig<T extends Config>(config: T): T;
}
