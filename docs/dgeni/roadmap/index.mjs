import Dgeni from "dgeni";
import fetchRoadmap from "./processors/fetch-roadmap.mjs";

const { Package } = Dgeni;

function roadmapConfig() {
	return {
		/** @type {string[]} Labels to omit from display (matched by full title). */
		hiddenLabels: [],
		/** @type {Record<string, string>} Maps component label suffix to a Font Awesome icon name. */
		componentIcons: {},
	};
}

export default new Package("roadmap", []).factory(roadmapConfig).processor(fetchRoadmap);
