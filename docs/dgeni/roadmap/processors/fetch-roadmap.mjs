import path from "node:path";
import { fetchEpics, readCache, writeCache } from "../services/gitlab-api.mjs";
import { filterHiddenEpics, sortEpics, transformEpic } from "../services/transform-epics.mjs";

const CACHE_PATH = path.resolve(import.meta.dirname, "../../cache/roadmap.json");

/**
 * Dgeni processor that fetches open epics from GitLab and makes them available
 * as `roadmap` in `renderDocsProcessor.extraData`.
 *
 * Serve from cache if fresh; otherwise fetch unauthenticated and write a new
 * cache entry. Filtering (hidden epics, hidden labels) is applied after cache
 * lookup so config changes do not require cache invalidation.
 *
 * @param {object} renderDocsProcessor Dgeni rendering processor (DI injected).
 * @param {{hiddenLabels: string[]}} roadmapConfig Roadmap configuration (DI injected).
 * @returns {{$runAfter: string[], $runBefore: string[], $process: Function}}
 */
export default function fetchRoadmapProcessor(renderDocsProcessor, roadmapConfig) {
	return {
		$runAfter: ["paths-computed"],
		$runBefore: ["rendering-docs"],
		$process: fetchAndInject,
	};

	async function fetchAndInject(docs) {
		let epics;
		const cached = readCache(CACHE_PATH);
		if (cached) {
			epics = cached;
		} else {
			const nodes = await fetchEpics();
			epics = sortEpics(nodes.map(transformEpic));
			writeCache(CACHE_PATH, epics);
		}

		epics = filterHiddenEpics(epics);

		if (roadmapConfig.hiddenLabels.length > 0) {
			const hidden = new Set(roadmapConfig.hiddenLabels);
			epics = epics.map((epic) => ({
				...epic,
				labels: epic.labels.filter((l) => !hidden.has(l.title)),
			}));
		}

		const icons = roadmapConfig.componentIcons;
		if (Object.keys(icons).length > 0) {
			epics = epics.map((epic) => {
				const match = epic.labels.find((l) => l.prefix === "component" && l.suffix in icons);
				return { ...epic, icon: match ? icons[match.suffix] : null };
			});
		}

		renderDocsProcessor.extraData.roadmap = epics;
		return docs;
	}
}
