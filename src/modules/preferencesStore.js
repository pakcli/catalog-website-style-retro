/**
 * Pure Business Logic: Preferences Store & Rule #4 Privacy Masking Protocol (2-Letter Exposure Rule)
 */
const STORAGE_KEY = 'retro_arcade_user_prefs';

export function maskSensitive(str) {
  if (!str) return '';
  if (str.length <= 2) return str;
  if (str.includes('@')) {
    const [user, domain] = str.split('@');
    const maskedUser = user.length <= 2 ? user : user.substring(0, 2) + '*'.repeat(Math.max(4, user.length - 2));
    return `${maskedUser}@${domain}`;
  }
  return str.substring(0, 2) + '*'.repeat(Math.max(4, str.length - 2));
}

export function loadPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    targetOs: 'Win 11',
    username: 'my****',
    email: 'my******@users.noreply.github.com',
    activeTool: 'all-lads-tool',
    isMasked: true
  };
}

export function savePreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (_) {}
}
