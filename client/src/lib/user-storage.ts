import * as React from "react";

const STORAGE_PREFIX = "multitool";

type StorageState<T> = {
  key: string;
  value: T;
};

export function scopedStorageKey(userId: string | null | undefined, key: string): string {
  const owner = userId ? `user.${userId}` : "anonymous";
  return `${STORAGE_PREFIX}.${owner}.${key}`;
}

export function removeStorageKeys(keys: string[]) {
  if (typeof window === "undefined") return;
  for (const key of keys) {
    localStorage.removeItem(key);
  }
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota or private-mode failures.
  }
}

export function useScopedLocalStorageState<T>(
  userId: string | null | undefined,
  key: string,
  fallback: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const storageKey = React.useMemo(() => scopedStorageKey(userId, key), [key, userId]);
  const fallbackRef = React.useRef(fallback);

  React.useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

  const [state, setState] = React.useState<StorageState<T>>(() => ({
    key: storageKey,
    value: readJson(storageKey, fallback),
  }));

  React.useEffect(() => {
    setState({
      key: storageKey,
      value: readJson(storageKey, fallbackRef.current),
    });
  }, [storageKey]);

  React.useEffect(() => {
    if (state.key !== storageKey) return;
    writeJson(storageKey, state.value);
  }, [state, storageKey]);

  const setValue = React.useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (next) => {
      setState((previous) => {
        const base =
          previous.key === storageKey
            ? previous.value
            : readJson(storageKey, fallbackRef.current);
        const value =
          typeof next === "function" ? (next as (current: T) => T)(base) : next;
        return { key: storageKey, value };
      });
    },
    [storageKey]
  );

  return [state.key === storageKey ? state.value : fallback, setValue];
}
