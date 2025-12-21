console.log("Grid Assistant initialized");

// Default settings
const DEFAULT_SETTINGS = {
  columns: 12,
  gutter: 20,
  margin: 16,
  maxWidth: 1200,
  opacity: 0.3,
  color: "#3b82f6",
  showGrid: false,
  showVerticalGrid: false,
  verticalColumns: 8,
  verticalGutter: 20,
  verticalMargin: 16,
};

let currentSettings = { ...DEFAULT_SETTINGS };
let horizontalGridOverlay: HTMLElement | null = null;
let verticalGridOverlay: HTMLElement | null = null;

async function getSettings() {
  try {
    const result = await chrome.storage.local.get("gridAssistantSettings");
    return { ...DEFAULT_SETTINGS, ...result.gridAssistantSettings };
  } catch (error) {
    console.error("Failed to load settings:", error);
    return DEFAULT_SETTINGS;
  }
}

async function saveSettings(settings: Partial<typeof DEFAULT_SETTINGS>) {
  try {
    const updatedSettings = { ...currentSettings, ...settings };
    await chrome.storage.local.set({ gridAssistantSettings: updatedSettings });
    currentSettings = updatedSettings;
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

function createHorizontalGridOverlay(settings: typeof DEFAULT_SETTINGS) {
  removeHorizontalGridOverlay();

  const styleElement = document.createElement("style");
  styleElement.setAttribute("data-horizontal-grid-styles", "true");
  styleElement.textContent = `
    #horizontal-grid-assistant-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
      display: flex;
      justify-content: center;
      border: none;
      outline: none;
    }

    #horizontal-grid-assistant-container {
      display: grid;
      grid-template-columns: repeat(${settings.columns}, 1fr);
      width: 100%;
      max-width: ${settings.maxWidth}px;
      height: 100%;
      gap: ${settings.gutter}px;
      padding: 0 ${settings.margin}px;
      border: none;
      outline: none;
      box-shadow: none;
    }

    #horizontal-grid-assistant-container .grid-column {
      background-color: ${settings.color};
      opacity: ${settings.opacity};
      border: none;
      outline: none;
      box-shadow: none;
      margin: 0;
      padding: 0;
    }
      `;

  horizontalGridOverlay = document.createElement("div");
  horizontalGridOverlay.id = "horizontal-grid-assistant-overlay";

  const gridContainer = document.createElement("div");
  gridContainer.id = "horizontal-grid-assistant-container";

  for (let i = 0; i < settings.columns; i++) {
    const column = document.createElement("div");
    column.className = "grid-column";
    gridContainer.appendChild(column);
  }

  document.head.appendChild(styleElement);
  horizontalGridOverlay.appendChild(gridContainer);
  document.body.appendChild(horizontalGridOverlay);
}

function createVerticalGridOverlay(settings: typeof DEFAULT_SETTINGS) {
  console.log("Creating vertical grid overlay", settings);
  removeVerticalGridOverlay();

  const styleElement = document.createElement("style");
  styleElement.setAttribute("data-vertical-grid-styles", "true");
  styleElement.textContent = `
    #vertical-grid-assistant-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      border: none;
      outline: none;
    }

    #vertical-grid-assistant-container {
      display: grid;
      grid-template-rows: repeat(${settings.verticalColumns}, 1fr);
      width: 100%;
      height: 100vh;
      gap: ${settings.verticalGutter}px;
      padding: ${settings.verticalMargin}px 0;
      border: none;
      outline: none;
      box-shadow: none;
    }

    #vertical-grid-assistant-container .grid-row {
      background-color: ${settings.color};
      opacity: ${settings.opacity};
      border: none;
      outline: none;
      box-shadow: none;
      margin: 0;
      padding: 0;
      min-height: 20px;
      width: 100%;
    }
      `;

  verticalGridOverlay = document.createElement("div");
  verticalGridOverlay.id = "vertical-grid-assistant-overlay";

  const gridContainer = document.createElement("div");
  gridContainer.id = "vertical-grid-assistant-container";

  for (let i = 0; i < settings.verticalColumns; i++) {
    const row = document.createElement("div");
    row.className = "grid-row";
    // Add debug styling temporarily
    row.style.backgroundColor = settings.color;
    row.style.opacity = settings.opacity.toString();
    row.style.minHeight = "20px";
    row.style.width = "100%";
    gridContainer.appendChild(row);
    console.log(`Created vertical grid row ${i + 1}`, row);
  }

  document.head.appendChild(styleElement);
  verticalGridOverlay.appendChild(gridContainer);
  document.body.appendChild(verticalGridOverlay);

  console.log("Vertical grid overlay created", verticalGridOverlay);
}

function removeHorizontalGridOverlay() {
  if (horizontalGridOverlay) {
    horizontalGridOverlay.remove();
    horizontalGridOverlay = null;
  }

  const styleElement = document.querySelector(
    "style[data-horizontal-grid-styles]",
  );
  if (styleElement) {
    styleElement.remove();
  }
}

function removeVerticalGridOverlay() {
  if (verticalGridOverlay) {
    verticalGridOverlay.remove();
    verticalGridOverlay = null;
  }

  const styleElement = document.querySelector(
    "style[data-vertical-grid-styles]",
  );
  if (styleElement) {
    styleElement.remove();
  }
}

function updateGridOverlays(settings: typeof DEFAULT_SETTINGS) {
  console.log("Updating grid overlays", {
    showGrid: settings.showGrid,
    showVerticalGrid: settings.showVerticalGrid,
    verticalColumns: settings.verticalColumns,
  });

  if (settings.showGrid) {
    if (horizontalGridOverlay) {
      removeHorizontalGridOverlay();
    }
    createHorizontalGridOverlay(settings);
  } else {
    removeHorizontalGridOverlay();
  }

  if (settings.showVerticalGrid) {
    if (verticalGridOverlay) {
      removeVerticalGridOverlay();
    }
    createVerticalGridOverlay(settings);
  } else {
    removeVerticalGridOverlay();
  }
}

async function init() {
  currentSettings = await getSettings();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case "TOGGLE_GRID":
        toggleGrid();
        break;
      case "UPDATE_SETTINGS":
        updateSettings(message.payload);
        break;
      case "GET_SETTINGS":
        sendSettingsResponse();
        break;
    }

    sendResponse({ success: true });
  });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "G") {
      e.preventDefault();
      toggleGrid();
    }
  });

  if (chrome.commands) {
    chrome.commands.onCommand.addListener((command) => {
      if (command === "toggle-grid") {
        toggleGrid();
      }
    });
  }

  updateGridOverlays(currentSettings);
}

function toggleGrid() {
  currentSettings.showGrid = !currentSettings.showGrid;
  updateGridOverlays(currentSettings);
  saveSettings({ showGrid: currentSettings.showGrid });
}

function updateSettings(newSettings: Partial<typeof DEFAULT_SETTINGS>) {
  currentSettings = { ...currentSettings, ...newSettings };
  saveSettings(newSettings);

  updateGridOverlays(currentSettings);
}

function sendSettingsResponse() {
  chrome.runtime.sendMessage({
    type: "SETTINGS_RESPONSE",
    payload: currentSettings,
  });
}

init().catch(console.error);
