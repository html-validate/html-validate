import { UserError } from "../error";
import { Config } from "./config";
import { type ConfigData } from "./config-data";
import { ConfigLoader } from "./config-loader";
import { type ResolvedConfig } from "./resolved-config";

const defaultConfig: ConfigData = {
	rules: {
		foo: "error",
	},
};

class AsyncMockLoader extends ConfigLoader {
	public override getGlobalConfig(): Config | Promise<Config> {
		return super.getGlobalConfig();
	}
	public override async getConfigFor(): Promise<ResolvedConfig> {
		const config = await this.getGlobalConfig();
		return config.resolve();
	}
	public override flushCache(): void {
		/* do nothing */
	}
	public override defaultConfig(): Config | Promise<Config> {
		return Config.fromObject(this.resolvers, defaultConfig);
	}
}

class SyncMockLoader extends ConfigLoader {
	public override getGlobalConfigSync(): Config {
		return super.getGlobalConfigSync();
	}
	public override getConfigFor(): ResolvedConfig | Promise<ResolvedConfig> {
		const config = this.getGlobalConfigSync();
		return config.resolve();
	}
	public override flushCache(): void {
		/* do nothing */
	}
	public override defaultConfig(): Config | Promise<Config> {
		return Config.fromObject(this.resolvers, defaultConfig);
	}
}

it("getGlobalConfig(..) use defaults", async () => {
	expect.assertions(1);
	const loader = new AsyncMockLoader([]);
	const config = await loader.getGlobalConfig();
	expect(config.get().rules).toEqual({
		foo: "error",
	});
});

it("getGlobalConfig(..) use explicit global config", async () => {
	expect.assertions(1);
	const loader = new AsyncMockLoader([], {
		rules: { bar: "error" },
	});
	const config = await loader.getGlobalConfig();
	expect(config.get().rules).toEqual({
		bar: "error",
	});
});

it("getGlobalConfig(..) should cache results", async () => {
	expect.assertions(3);
	const loader = new AsyncMockLoader([]);
	const defaultConfig = jest.spyOn(loader, "defaultConfig");
	expect(defaultConfig).toHaveBeenCalledTimes(0);
	await loader.getGlobalConfig();
	expect(defaultConfig).toHaveBeenCalledTimes(1);
	await loader.getGlobalConfig();
	expect(defaultConfig).toHaveBeenCalledTimes(1);
});

it("getGlobalConfigSync(..) use defaults", () => {
	expect.assertions(1);
	const loader = new SyncMockLoader([]);
	const config = loader.getGlobalConfigSync();
	expect(config.get().rules).toEqual({
		foo: "error",
	});
});

it("getGlobalConfigSync(..) use explicit global config", () => {
	expect.assertions(1);
	const loader = new SyncMockLoader([], {
		rules: { bar: "error" },
	});
	const config = loader.getGlobalConfigSync();
	expect(config.get().rules).toEqual({
		bar: "error",
	});
});

it("getGlobalConfigSync(..) should cache results", () => {
	expect.assertions(3);
	const loader = new SyncMockLoader([]);
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
		public override getConfigFor(): ResolvedConfig | Promise<ResolvedConfig> {
			const config = this.getGlobalConfigSync();
			return config.resolve();
		}
		public override flushCache(): void {
			/* do nothing */
		}
		public override defaultConfig(): Promise<Config> {
			return Promise.resolve(Config.empty());
		}
	}
	const loader = new MockLoader([]);
	expect(() => loader.getConfigFor()).toThrow(UserError);
	expect(() => loader.getConfigFor()).toThrow("Cannot load async config from sync function");
});
