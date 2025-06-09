
// Settings storage utilities for persisting user preferences

export interface AppSettings {
  periodReminder: boolean;
  ovulationReminder: boolean;
  appLock: boolean;
  biometricAuth: boolean;
  dataSharing: boolean;
}

// Local storage keys
const SETTINGS_KEY = "period_tracker_settings";

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  periodReminder: true,
  ovulationReminder: true,
  appLock: false,
  biometricAuth: false,
  dataSharing: false,
};

// Get all settings from localStorage
export function getSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    
    const parsed = JSON.parse(stored);
    
    // Merge with defaults to handle cases where new settings are added
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch (error) {
    console.error("Error loading settings:", error);
    return DEFAULT_SETTINGS;
  }
}

// Save all settings to localStorage
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

// Update a specific setting
export function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): void {
  const currentSettings = getSettings();
  const updatedSettings = {
    ...currentSettings,
    [key]: value,
  };
  saveSettings(updatedSettings);
}

// Get a specific setting value
export function getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
  const settings = getSettings();
  return settings[key];
}
