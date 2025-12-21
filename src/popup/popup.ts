import type { GridSettings, ExtensionMessage } from "../types";
import { DEFAULT_SETTINGS } from "../types";
import { StorageManager } from "../utils/storage";
import "./popup.css";

class PopupManager {
  private settings: GridSettings = DEFAULT_SETTINGS;
  private elements: { [key: string]: HTMLElement | NodeListOf<Element> } = {};

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    this.cacheElements();
    this.setupEventListeners();
    await this.loadSettings();
    this.updateUI();
  }

  private cacheElements(): void {
    const elementIds = [
      "grid-toggle",
      "columns",
      "gutter",
      "margin",
      "max-width",
      "opacity",
      "color",
      "color-text",
      "columns-value",
      "gutter-value",
      "margin-value",
      "max-width-value",
      "opacity-value",
      "show-vertical-grid",
      "vertical-columns",
      "vertical-gutter",
      "vertical-margin",
      "vertical-columns-value",
      "vertical-gutter-value",
      "vertical-margin-value",
      "reset-btn",
    ];

    elementIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        this.elements[id] = element;
      }
    });

    this.elements.presetButtons = document.querySelectorAll(".preset-btn");
  }

  private setupEventListeners(): void {
    const toggleElement = this.elements["grid-toggle"] as HTMLInputElement;
    toggleElement?.addEventListener("change", () => {
      this.updateSetting("showGrid", toggleElement.checked);
      this.sendToggleMessage();
    });

    this.setupRangeInput("columns", "columns-value", (value) => {
      this.updateSetting("columns", parseInt(value));
    });

    this.setupRangeInput("gutter", "gutter-value", (value) => {
      this.updateSetting("gutter", parseInt(value));
    });

    this.setupRangeInput("margin", "margin-value", (value) => {
      this.updateSetting("margin", parseInt(value));
    });

    this.setupRangeInput("max-width", "max-width-value", (value) => {
      this.updateSetting("maxWidth", parseInt(value));
    });

    this.setupRangeInput("opacity", "opacity-value", (value) => {
      this.updateSetting("opacity", parseFloat(value));
    });

    const colorElement = this.elements.color as HTMLInputElement;
    const colorTextElement = this.elements["color-text"] as HTMLInputElement;

    colorElement?.addEventListener("input", (e) => {
      const color = (e.target as HTMLInputElement).value;
      colorTextElement.value = color;
      this.updateSetting("color", color);
    });

    colorTextElement?.addEventListener("input", (e) => {
      const color = (e.target as HTMLInputElement).value;
      if (/^#[0-9A-F]{6}$/i.test(color)) {
        colorElement.value = color;
        this.updateSetting("color", color);
      }
    });

    const showVerticalGridElement = this.elements[
      "show-vertical-grid"
    ] as HTMLInputElement;
    showVerticalGridElement?.addEventListener("change", () => {
      this.updateSetting("showVerticalGrid", showVerticalGridElement.checked);
      this.sendUpdateMessage();
    });

    this.setupRangeInput(
      "vertical-columns",
      "vertical-columns-value",
      (value) => {
        this.updateSetting("verticalColumns", parseInt(value));
      },
    );

    this.setupRangeInput(
      "vertical-gutter",
      "vertical-gutter-value",
      (value) => {
        this.updateSetting("verticalGutter", parseInt(value));
      },
    );

    this.setupRangeInput(
      "vertical-margin",
      "vertical-margin-value",
      (value) => {
        this.updateSetting("verticalMargin", parseInt(value));
      },
    );

    const resetBtn = this.elements["reset-btn"] as HTMLButtonElement;
    resetBtn?.addEventListener("click", () => {
      this.resetToDefault();
    });

    const presetButtons = this.elements.presetButtons as NodeListOf<Element>;
    presetButtons?.forEach((button: Element) => {
      button.addEventListener("click", (e: Event) => {
        const width = parseInt((e.target as HTMLElement).dataset.width || "0");
        this.applyPreset(width);
      });
    });
  }

  private setupRangeInput(
    inputId: string,
    valueId: string,
    onChange: (value: string) => void,
  ): void {
    const input = this.elements[inputId] as HTMLInputElement;
    const valueDisplay = this.elements[valueId] as HTMLElement;

    input?.addEventListener("input", (e) => {
      const value = (e.target as HTMLInputElement).value;

      // Update the display value
      if (valueDisplay) {
        valueDisplay.textContent = this.formatDisplayValue(inputId, value);
      }

      onChange(value);
    });
  }

  private formatDisplayValue(inputId: string, value: string): string {
    switch (inputId) {
      case "gutter":
      case "margin":
      case "max-width":
      case "vertical-gutter":
      case "vertical-margin":
        return `${value}px`;
      case "opacity":
        return value;
      case "columns":
      case "vertical-columns":
      default:
        return value;
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      this.settings = await StorageManager.getSettings();
    } catch (error) {
      console.error("Failed to load settings:", error);
      this.settings = DEFAULT_SETTINGS;
    }
  }

  private updateUI(): void {
    const toggleElement = this.elements["grid-toggle"] as HTMLInputElement;
    if (toggleElement) {
      toggleElement.checked = this.settings.showGrid;
    }

    this.updateInputValue("columns", this.settings.columns);
    this.updateInputValue("gutter", this.settings.gutter);
    this.updateInputValue("margin", this.settings.margin);
    this.updateInputValue("max-width", this.settings.maxWidth);
    this.updateInputValue("opacity", this.settings.opacity);

    this.updateDisplayValue("columns-value", this.settings.columns.toString());
    this.updateDisplayValue("gutter-value", `${this.settings.gutter}px`);
    this.updateDisplayValue("margin-value", `${this.settings.margin}px`);
    this.updateDisplayValue("max-width-value", `${this.settings.maxWidth}px`);
    this.updateDisplayValue("opacity-value", this.settings.opacity.toString());

    const colorElement = this.elements.color as HTMLInputElement;
    const colorTextElement = this.elements["color-text"] as HTMLInputElement;
    if (colorElement && colorTextElement) {
      colorElement.value = this.settings.color;
      colorTextElement.value = this.settings.color;
    }

    const showVerticalGridElement = this.elements[
      "show-vertical-grid"
    ] as HTMLInputElement;
    if (showVerticalGridElement) {
      showVerticalGridElement.checked = this.settings.showVerticalGrid;
    }

    this.updateInputValue("vertical-columns", this.settings.verticalColumns);
    this.updateInputValue("vertical-gutter", this.settings.verticalGutter);
    this.updateInputValue("vertical-margin", this.settings.verticalMargin);

    this.updateDisplayValue(
      "vertical-columns-value",
      this.settings.verticalColumns.toString(),
    );
    this.updateDisplayValue(
      "vertical-gutter-value",
      `${this.settings.verticalGutter}px`,
    );
    this.updateDisplayValue(
      "vertical-margin-value",
      `${this.settings.verticalMargin}px`,
    );
  }

  private updateInputValue(id: string, value: number): void {
    const element = this.elements[id] as HTMLInputElement;
    if (element) {
      element.value = value.toString();
    }
  }

  private updateDisplayValue(id: string, value: string): void {
    const element = this.elements[id] as HTMLElement;
    if (element) {
      element.textContent = value;
    }
  }

  private async updateSetting<K extends keyof GridSettings>(
    key: K,
    value: GridSettings[K],
  ): Promise<void> {
    this.settings[key] = value;
    await StorageManager.saveSettings({ [key]: value });
    this.sendUpdateMessage();
  }

  private sendToggleMessage(): Promise<void> {
    return this.sendMessage({ type: "TOGGLE_GRID" });
  }

  private sendUpdateMessage(): Promise<void> {
    return this.sendMessage({
      type: "UPDATE_SETTINGS",
      payload: this.settings,
    });
  }

  private sendMessage(message: ExtensionMessage): Promise<void> {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          console.log("Chrome runtime error:", chrome.runtime.lastError);
          resolve();
          return;
        }

        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            if (chrome.runtime.lastError) {
              resolve();
              return;
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

  private async resetToDefault(): Promise<void> {
    await StorageManager.resetSettings();

    await this.loadSettings();

    await this.sendMessage({ type: "UPDATE_SETTINGS", payload: this.settings });

    this.updateUI();
  }

  private async applyPreset(width: number): Promise<void> {
    await this.updateSetting("maxWidth", width);
    this.updateUI();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new PopupManager();
});
