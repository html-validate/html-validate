import Dgeni from "dgeni";
import generateExampleCode from "./processors/generate-example-code.mjs";
import example from "./services/example.mjs";

const { Package } = Dgeni;

export default new Package("example").factory(example).processor(generateExampleCode);
