const STORAGE_KEY = 'traitor-elim/participants';

export function loadParticipants() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveParticipants(participants) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}

// Native 'storage' event only fires in OTHER tabs/windows of the same origin,
// which is exactly what we want: the Admin tab writes, the User View tab (a
// separate browser tab/window) picks up the change with no server involved.
export function subscribeToParticipants(callback) {
  function handler(event) {
    if (event.key && event.key !== STORAGE_KEY) return;
    callback(loadParticipants());
  }
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
