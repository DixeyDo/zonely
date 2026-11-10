import { useSyncExternalStore } from "react";

type Listener = () => void;

/* ---------- A clock that ticks exactly on every new second ---------- */

let secondNow = 0;
let secondTimer: ReturnType<typeof setTimeout> | null = null;
const secondListeners = new Set<Listener>();

function currentSecond() {
  const now = Date.now();
  return now - (now % 1000);
}

function emitSecond() {
  secondNow = currentSecond();
  secondListeners.forEach((listener) => listener());
}

function scheduleNextSecond() {
  const delay = 1000 - (Date.now() % 1000) + 5;
  secondTimer = setTimeout(() => {
    emitSecond();
    scheduleNextSecond();
  }, delay);
}

function onVisibilityChange() {
  if (document.visibilityState !== "visible") return;
  // When the app comes back to the foreground, refresh right away.
  if (secondTimer !== null) clearTimeout(secondTimer);
  emitSecond();
  scheduleNextSecond();
}

function subscribeSecond(listener: Listener) {
  secondListeners.add(listener);
  if (secondListeners.size === 1) {
    secondNow = currentSecond();
    scheduleNextSecond();
    document.addEventListener("visibilitychange", onVisibilityChange);
  }
  return () => {
    secondListeners.delete(listener);
    if (secondListeners.size === 0) {
      if (secondTimer !== null) clearTimeout(secondTimer);
      secondTimer = null;
      document.removeEventListener("visibilitychange", onVisibilityChange);
    }
  };
}

function getSecondSnapshot() {
  if (secondListeners.size === 0) secondNow = currentSecond();
  return secondNow;
}

function getServerNull() {
  return null;
}

/** Current time in ms, updated once per second. `null` while pre-rendering. */
export function useSecondClock(): number | null {
  return useSyncExternalStore(subscribeSecond, getSecondSnapshot, getServerNull);
}

/* ---------- A clock that updates every animation frame (~60 fps) ---------- */

let frameNow = 0;
let frameId: number | null = null;
const frameListeners = new Set<Listener>();

function currentFrameTime() {
  const now = Date.now();
  return now - (now % 10);
}

function frameLoop() {
  frameId = requestAnimationFrame(() => {
    frameNow = Date.now();
    frameListeners.forEach((listener) => listener());
    frameLoop();
  });
}

function subscribeFrame(listener: Listener) {
  frameListeners.add(listener);
  if (frameListeners.size === 1) {
    frameNow = Date.now();
    frameLoop();
  }
  return () => {
    frameListeners.delete(listener);
    if (frameListeners.size === 0 && frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };
}

function getFrameSnapshot() {
  if (frameListeners.size === 0) frameNow = currentFrameTime();
  return frameNow;
}

function subscribeNothing() {
  return () => {};
}

/**
 * Current time in ms, updated every frame while `active` is true.
 * Returns `null` when inactive or while pre-rendering.
 */
export function useFrameClock(active: boolean): number | null {
  return useSyncExternalStore(
    active ? subscribeFrame : subscribeNothing,
    active ? getFrameSnapshot : getServerNull,
    getServerNull,
  );
}