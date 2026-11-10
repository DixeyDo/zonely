import { createPersistentStore } from "./store";

/* ---------- Saved world clocks ---------- */

export type SavedZone = {
  id: string;
  timeZone: string; // IANA name, e.g. "America/New_York"
  city: string; // e.g. "New York"
  label: string; // your custom name, e.g. "ET" (empty = show the city)
};

export const zonesStore = createPersistentStore<SavedZone[]>("zonely.zones.v1", []);

export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function addZone(timeZone: string, city: string, label: string) {
  zonesStore.set((zones) => [
    ...zones,
    { id: makeId(), timeZone, city, label: label.trim() },
  ]);
}

export function updateZoneLabel(id: string, label: string) {
  zonesStore.set((zones) =>
    zones.map((zone) => (zone.id === id ? { ...zone, label: label.trim() } : zone)),
  );
}

export function removeZone(id: string) {
  zonesStore.set((zones) => zones.filter((zone) => zone.id !== id));
}

export function moveZone(id: string, direction: -1 | 1) {
  zonesStore.set((zones) => {
    const index = zones.findIndex((zone) => zone.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= zones.length) return zones;
    const next = [...zones];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
}

/* ---------- Settings ---------- */

export type Settings = {
  hour12: boolean | null; // null = follow the phone's language
  analog: boolean; // show the big clock as analog
};

export const settingsStore = createPersistentStore<Settings>("zonely.settings.v1", {
  hour12: null,
  analog: false,
});

/* ---------- Stopwatch ---------- */

export type StopwatchState = {
  startedAt: number | null; // when the current run started (null = stopped)
  accumulated: number; // ms collected in earlier runs
  laps: number[]; // total elapsed ms at each lap press
};

export const stopwatchStore = createPersistentStore<StopwatchState>(
  "zonely.stopwatch.v1",
  { startedAt: null, accumulated: 0, laps: [] },
);

/* ---------- Timer ---------- */

export type TimerState = {
  durationMs: number; // full length of the current timer (for the ring)
  endsAt: number | null; // set while running
  remainingMs: number | null; // set while paused
  lastInput: string; // digits typed last time, e.g. "500" = 5:00
};

export const timerStore = createPersistentStore<TimerState>("zonely.timer.v1", {
  durationMs: 0,
  endsAt: null,
  remainingMs: null,
  lastInput: "",
});