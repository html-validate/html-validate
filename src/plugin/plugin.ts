import { RuleConstructor } from "../rule";

export interface Plugin {
	rules: { [key: string]: RuleConstructor };
}
