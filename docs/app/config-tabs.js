const SESSION_KEY = "config-variant";

/**
 * @param {HTMLElement[]} tabs
 * @param {HTMLElement} selected
 */
function selectTab(tabs, selected) {
	for (const element of tabs) {
		element.setAttribute("aria-selected", element === selected ? "true" : "false");
		element.setAttribute("tabindex", element === selected ? "0" : "-1");
		element.classList.toggle("config-tabs__tablist--active", element === selected);
	}
}

/**
 * @param {HTMLElement[]} panels
 * @param {HTMLElement} selected
 */
function openPanel(panels, selected) {
	for (const element of panels) {
		element.hidden = element !== selected;
	}
}

/**
 * @param {string} key
 */
function changeVariant(key) {
	const updateEvent = new CustomEvent("config:change", { detail: { key } });
	for (const element of configurations) {
		element.dispatchEvent(updateEvent);
	}
}

let id = 1;
const configurations = Array.from(document.querySelectorAll(".config-tabs"));

for (const element of configurations) {
	const idPrefix = `config-${id++}`;
	const panelId = (index) => `${idPrefix}-panel-${index + 1}`;
	const tabId = (index) => `${idPrefix}-tab-${index + 1}`;
	const panels = Array.from(element.querySelectorAll("pre"));

	/** {@type HTMLElement} */
	const bar = element.querySelector(".config-tabs__bar");

	/** {@type HTMLElement} */
	const filename = element.querySelector(".config-tabs__filename");

	const tablist = document.createElement("ul");
	tablist.setAttribute("role", "tablist");
	tablist.setAttribute("aria-orientation", "horizontal");
	tablist.className = "config-tabs__tablist";
	bar.append(tablist);

	/* create tabs for each panel */
	const tabs = panels.map((panel, index) => {
		const { key, label } = panel.dataset;

		panel.setAttribute("role", "tabpanel");
		panel.setAttribute("aria-labelledby", tabId(index));
		panel.id = panelId(index);

		const tab = document.createElement("li");
		tab.setAttribute("role", "tab");
		tab.setAttribute("aria-selected", "false");
		tab.setAttribute("aria-controls", panelId(index));
		tab.setAttribute("tabindex", "-1");
		tab.className = "config-tabs__tab";
		tab.id = tabId(index);
		tab.textContent = label;
		tab.dataset.key = key;

		tablist.append(tab);

		return tab;
	});

	tablist.addEventListener("keydown", (event) => {
		const { target, code } = event;
		switch (code) {
			case "ArrowLeft": {
				target.previousElementSibling?.focus();
				break;
			}
			case "ArrowRight": {
				target.nextElementSibling?.focus();
				break;
			}
			case "Enter": {
				const key = target.dataset.key;
				if (key) {
					window.localStorage.setItem(SESSION_KEY, key);
					changeVariant(key);
				}
				break;
			}
		}
	});

	tablist.addEventListener("click", (event) => {
		const { target } = event;
		const key = target.dataset.key;
		if (key) {
			window.localStorage.setItem(SESSION_KEY, key);
			changeVariant(key);
		}
	});

	element.addEventListener("config:change", (event) => {
		const { key } = event.detail;
		const selectedTab = tabs.find((it) => it.dataset.key === key);
		const selectedPanel = panels.find((it) => it.dataset.key === key);
		if (selectedTab) {
			selectTab(tabs, selectedTab);
		}
		if (selectedPanel) {
			openPanel(panels, selectedPanel);
			filename.textContent = selectedPanel.dataset.filename;
		}
	});

	element.prepend(bar);
}

const preselected = window.localStorage.getItem(SESSION_KEY) ?? "json";
changeVariant(preselected);
