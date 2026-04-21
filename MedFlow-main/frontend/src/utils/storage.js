const PREFIX = "";

function safeJsonParse(value) {
  if (!value || typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function safeJsonStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify(null);
  }
}

export function getData(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    const parsed = safeJsonParse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
}

export function setData(key, value) {
  window.localStorage.setItem(PREFIX + key, safeJsonStringify(value));
  return value;
}

export function updateData(key, updater, fallback) {
  const current = getData(key, fallback);
  const next = typeof updater === "function" ? updater(current) : current;
  setData(key, next);
  return next;
}

