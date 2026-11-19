const STORAGE_KEY = 'tutorflow_voice_prefs';

export const defaultVoicePrefs = {
  enabled: true,
  rate: 1,
};

export function getVoicePrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...defaultVoicePrefs, ...saved };
  } catch {
    return defaultVoicePrefs;
  }
}

export function saveVoicePrefs(prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
