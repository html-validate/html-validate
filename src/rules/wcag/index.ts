import { RuleConstructor } from "../../rule";

import H30 from "./h30";
import H32 from "./h32";
import H36 from "./h36";
import H37 from "./h37";
import H67 from "./h67";
import H71 from "./h71";

const bundledRules: Record<string, RuleConstructor<any, any>> = {
	"wcag/h30": H30,
	"wcag/h32": H32,
	"wcag/h36": H36,
	"wcag/h37": H37,
	"wcag/h67": H67,
	"wcag/h71": H71,
};

export default bundledRules;
