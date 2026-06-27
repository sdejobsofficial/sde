export const NOTIFICATION_WINDOW_DAYS = 3;

const STORAGE_KEY = "readNotificationIds";

function isWithinWindow(createdAt: string): boolean {
  const cutoff = Date.now() - NOTIFICATION_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return new Date(createdAt).getTime() >= cutoff;
}

function readStoredIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeStoredIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
  }
}

export function isNotificationRead(id: string): boolean {
  return readStoredIds().has(id);
}

export function markNotificationRead(id: string) {
  const ids = readStoredIds();
  ids.add(id);
  writeStoredIds(ids);
}

export function markNotificationsRead(ids: string[]) {
  const stored = readStoredIds();
  ids.forEach((id) => stored.add(id));
  writeStoredIds(stored);
}

export function markNotificationUnread(id: string) {
  const ids = readStoredIds();
  ids.delete(id);
  writeStoredIds(ids);
}

export function filterUnreadWithinWindow<
  T extends { Id: string; CreatedAt: string },
>(notifications: T[]): T[] {
  const readIds = readStoredIds();
  return notifications.filter(
    (n) => isWithinWindow(n.CreatedAt) && !readIds.has(n.Id),
  );
}
