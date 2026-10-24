import Dgeni from "dgeni";
import navtreeProcessor from "./processors/navtree-processor.mjs";

const { Package } = Dgeni;

export default new Package("navigation", []).processor(navtreeProcessor);
