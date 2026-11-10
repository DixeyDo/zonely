import { useSyncExternalStore } from "react";

type Listener = () => void;
type Updater<T> = T | ((previous: T) => T);

export type PersistentStore<T> = {
  get: () => T;
  set: (next: Updater<T>) => void;
  useValue: () => T;
};

/**
 * A tiny global store that saves its value in localStorage.
 * Every component that calls `store.useValue()` re-renders when the value changes.
 */
export function createPersistentStore<T>(
  key: string,
  initialValue: T,
): PersistentStore<T> {
  let value: T = initialValue;
  let loaded = false;
  const listeners = new Set<Listener>();

  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as T;
        if (parsed !== null && parsed !== undefined) value = parsed;
      }
    } catch {
      // Corrupted or unavailable storage: keep the initial value.
    }
  }

  function get(): T {
    load();
    return value;
  }

  function set(next: Updater<T>) {
    load();
    value =
      typeof next === "function"
        ? (next as (previous: T) => T)(value)
        : next;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable: the value still lives in memory.
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function getServerSnapshot(): T {
    return initialValue;
  }

  function useValue(): T {
    return useSyncExternalStore(subscribe, get, getServerSnapshot);
  }

  return { get, set, useValue };
}