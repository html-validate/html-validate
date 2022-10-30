declare module "cypress" {
	interface Config {
		e2e: {
			setupNodeEvents(on: (action: "task", arg: Record<string, (value: any) => any>) => void): void;
		};
	}

	export function defineConfig<T extends Config>(config: T): T;
}
