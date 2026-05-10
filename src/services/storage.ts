const memoryStorage = new Map<string, string>();

const hasLocalStorage = (): boolean => {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
};

const readRaw = (key: string): string | null => {
  if (hasLocalStorage()) {
    return window.localStorage.getItem(key);
  }

  return memoryStorage.get(key) ?? null;
};

const writeRaw = (key: string, value: string): void => {
  if (hasLocalStorage()) {
    window.localStorage.setItem(key, value);
    return;
  }

  memoryStorage.set(key, value);
};

const removeRaw = (key: string): void => {
  if (hasLocalStorage()) {
    window.localStorage.removeItem(key);
    return;
  }

  memoryStorage.delete(key);
};

export const loadJson = <T>(key: string, fallback: T): T => {
  const raw = readRaw(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const saveJson = <T>(key: string, value: T): void => {
  writeRaw(key, JSON.stringify(value));
};

export const removeKey = (key: string): void => {
  removeRaw(key);
};
