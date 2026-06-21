import Dgeni from "dgeni";
import generateExampleCode from "./processors/generate-example-code.mjs";
import example from "./services/example.mjs";

const { Package } = Dgeni;

/* eslint-disable-next-line unicorn/no-unreadable-new-expression -- established pattern for dgeni */
export default new Package("example").factory(example).processor(generateExampleCode);
