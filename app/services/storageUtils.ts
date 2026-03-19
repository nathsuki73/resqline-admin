export const isBrowserRuntime = (): boolean => typeof window !== "undefined";

export const readStorageString = (key: string): string | null => {
  if (!isBrowserRuntime()) return null;
  return window.localStorage.getItem(key);
};

export const writeStorageString = (key: string, value: string): void => {
  if (!isBrowserRuntime()) return;
  window.localStorage.setItem(key, value);
};

export const removeStorageItem = (key: string): void => {
  if (!isBrowserRuntime()) return;
  window.localStorage.removeItem(key);
};

export const readStorageJson = <T>(key: string, fallback: T): T => {
  const raw = readStorageString(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const writeStorageJson = (key: string, value: unknown): void => {
  writeStorageString(key, JSON.stringify(value));
};
