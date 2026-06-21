import fs from "node:fs";
import path from "node:path";

const CACHE_TTL_MS = 15 * 60 * 1000; /* 15 minutes */
const GRAPHQL_TIMEOUT_MS = 30_000; /* 30 seconds */

/* eslint-disable-next-line unicorn/comment-content -- false positive */
const GRAPHQL_QUERY = /* graphql */ `
  query RoadmapEpics {
    group(fullPath: "html-validate") {
      workItems(types: [EPIC], state: opened) {
        nodes {
          iid
          title
          description
          state
          webUrl
          widgets {
            ... on WorkItemWidgetWeight {
              weight
              __typename
            }
            ... on WorkItemWidgetColor {
              color
              textColor
              __typename
            }
            ... on WorkItemWidgetLabels {
              labels {
                nodes {
                  title
                  color
                  textColor
                }
              }
              __typename
            }
            ... on WorkItemWidgetStartAndDueDate {
              dueDate
              __typename
            }
            ... on WorkItemWidgetHierarchy {
              children {
                nodes {
                  iid
                  title
                  state
                  webUrl
                }
              }
              __typename
            }
          }
        }
      }
    }
  }
`;

/**
 * Read cached epics from disk. Returns null if the file is missing or older
 * than the cache TTL.
 *
 * @param {string} cachePath
 * @returns {unknown[] | null}
 */
export function readCache(cachePath) {
	try {
		const raw = fs.readFileSync(cachePath, "utf-8");
		const { timestamp, epics } = JSON.parse(raw);
		if (Date.now() - timestamp < CACHE_TTL_MS) {
			return epics;
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Write epics to the cache file, creating the directory if needed.
 *
 * @param {string} cachePath
 * @param {unknown[]} epics
 */
export function writeCache(cachePath, epics) {
	fs.mkdirSync(path.dirname(cachePath), { recursive: true });
	fs.writeFileSync(cachePath, JSON.stringify({ timestamp: Date.now(), epics }), "utf-8");
}

/**
 * @param {AbortController} controller
 * @returns {Promise<Response>}
 */
async function graphqlFetch(controller) {
	try {
		return await fetch("https://gitlab.com/api/graphql", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ query: GRAPHQL_QUERY }),
			signal: controller.signal,
		});
	} catch (err) {
		if (controller.signal.aborted) {
			throw new Error(`GitLab GraphQL request timed out after ${GRAPHQL_TIMEOUT_MS / 1000} s`, {
				cause: err,
			});
		}
		throw err;
	}
}

/**
 * Fetch open epics from the GitLab GraphQL API. Throws if the request fails or
 * the response contains errors.
 *
 * @returns {Promise<unknown[]>}
 */
export async function fetchEpics() {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), GRAPHQL_TIMEOUT_MS);

	let response;
	try {
		response = await graphqlFetch(controller);
	} finally {
		clearTimeout(timer);
	}

	if (!response.ok) {
		throw new Error(`GitLab GraphQL API returned HTTP ${response.status} ${response.statusText}`);
	}

	const { data, errors } = await response.json();

	if (errors?.length > 0) {
		const messages = errors.map((e) => `  - ${e.message}`).join("\n");
		throw new Error(`GitLab GraphQL errors:\n${messages}`);
	}

	if (!Array.isArray(data?.group?.workItems?.nodes)) {
		throw new TypeError(
			`GitLab GraphQL response has unexpected shape: ${JSON.stringify(data ?? errors)}`,
		);
	}

	return data.group.workItems.nodes;
}
