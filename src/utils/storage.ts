import type { GridSettings } from "../types";
import { DEFAULT_SETTINGS } from "../types";

export class StorageManager {
  private static readonly STORAGE_KEY = "gridAssistantSettings";

  static async saveSettings(settings: Partial<GridSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };

      await chrome.storage.local.set({
        [this.STORAGE_KEY]: updatedSettings,
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  static async getSettings(): Promise<GridSettings> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      return { ...DEFAULT_SETTINGS, ...result[this.STORAGE_KEY] };
    } catch (error) {
      console.error("Failed to get settings:", error);
      return DEFAULT_SETTINGS;
    }
  }

  static async resetSettings(): Promise<void> {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEY]: DEFAULT_SETTINGS,
      });
    } catch (error) {
      console.error("Failed to reset settings:", error);
    }
  }
}
