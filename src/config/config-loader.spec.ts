import { UserError } from "../error";
import { Config } from "./config";
import { ConfigLoader } from "./config-loader";
import { type ResolvedConfig } from "./resolved-config";

it("getGlobalConfig(..) should cache results", async () => {
	expect.assertions(3);
	class MockLoader extends ConfigLoader {
		public async getConfigFor(): Promise<ResolvedConfig> {
			const config = await this.getGlobalConfig();
			return config.resolve();
		}
		public flushCache(): void {
			/* do nothing */
		}
		public defaultConfig(): Config {
			return Config.empty();
		}
	}
	const loader = new MockLoader([]);
	const defaultConfig = jest.spyOn(loader, "defaultConfig");
	expect(defaultConfig).toHaveBeenCalledTimes(0);
	await loader.getConfigFor();
	expect(defaultConfig).toHaveBeenCalledTimes(1);
	await loader.getConfigFor();
	expect(defaultConfig).toHaveBeenCalledTimes(1);
});

it("getGlobalConfigSync(..) should cache results", () => {
	expect.assertions(3);
	class MockLoader extends ConfigLoader {
		public getConfigFor(): ResolvedConfig {
			const config = this.getGlobalConfigSync();
			return config.resolve();
		}
		public flushCache(): void {
			/* do nothing */
		}
		public defaultConfig(): Config {
			return Config.empty();
		}
	}
	const loader = new MockLoader([]);
	const defaultConfig = jest.spyOn(loader, "defaultConfig");
	expect(defaultConfig).toHaveBeenCalledTimes(0);
	loader.getConfigFor();
	expect(defaultConfig).toHaveBeenCalledTimes(1);
	loader.getConfigFor();
	expect(defaultConfig).toHaveBeenCalledTimes(1);
});

it("getGlobalConfigSync(..) should throw an error if trying to use async results", () => {
	expect.assertions(2);
	class MockLoader extends ConfigLoader {
		public getConfigFor(): ResolvedConfig {
			const config = this.getGlobalConfigSync();
			return config.resolve();
		}
		public flushCache(): void {
			/* do nothing */
		}
		public defaultConfig(): Promise<Config> {
			return Promise.resolve(Config.empty());
		}
	}
	const loader = new MockLoader([]);
	expect(() => loader.getConfigFor()).toThrow(UserError);
	expect(() => loader.getConfigFor()).toThrow("Cannot load async config from sync function");
});
