/**
 * Small wrappers around Capacitor plugins.
 * Plugins are loaded with dynamic import() so the code never runs during the
 * Next.js build, and every function quietly does nothing in a normal browser.
 */

type ListenerHandle = { remove: () => Promise<void> };

const TIMER_NOTIFICATION_ID = 1001;
const TIMER_CHANNEL_ID = "timer-alerts";

// Notification calls run one after another, so a quick Start → Pause can never
// leave a stale notification scheduled.
let notificationQueue: Promise<unknown> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = notificationQueue.then(task, task);
  notificationQueue = result.catch(() => undefined);
  return result;
}

/** True once the user has tapped the page (browsers require this for sound and vibration). */
function userHasInteracted(): boolean {
  const nav = navigator as Navigator & { userActivation?: { hasBeenActive: boolean } };
  return nav.userActivation?.hasBeenActive ?? true;
}

export async function isNative(): Promise<boolean> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** Runs `callback` when the Android back button is pressed. */
export async function onBackButton(callback: () => void): Promise<ListenerHandle | null> {
  if (!(await isNative())) return null;
  const { App } = await import("@capacitor/app");
  return App.addListener("backButton", () => callback());
}

/** A light tap you can feel. */
export async function tapHaptic(): Promise<void> {
  try {
    if (!(await isNative())) return;
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Haptics are a nice-to-have; ignore failures.
  }
}

/** A long buzz for when the timer finishes while the app is open. */
export async function alertVibration(): Promise<void> {
  try {
    if (await isNative()) {
      const { Haptics } = await import("@capacitor/haptics");
      await Haptics.vibrate({ duration: 800 });
    } else if ("vibrate" in navigator && userHasInteracted()) {
      navigator.vibrate([300, 150, 300]);
    }
  } catch {
    // Ignore.
  }
}

/** A short chime made with the Web Audio API (used in the browser only). */
export function playWebChime(): void {
  if (!userHasInteracted()) return;
  try {
    const context = new AudioContext();
    const notes = [880, 1318.5, 880, 1318.5];
    notes.forEach((frequency, index) => {
      const start = context.currentTime + index * 0.28;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.26);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.27);
    });
    setTimeout(() => void context.close(), 1500);
  } catch {
    // Audio blocked or unsupported; ignore.
  }
}

async function ensureTimerChannel(): Promise<void> {
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.createChannel({
    id: TIMER_CHANNEL_ID,
    name: "Timer",
    description: "Alerts when a timer finishes",
    importance: 5,
    visibility: 1,
    sound: "timer_chime.wav",
    vibration: true,
  });
}

/**
 * Schedules the "Time's up" notification. Returns false if the user has
 * turned notifications off (the timer still works while the app is open).
 */
export function scheduleTimerNotification(endsAt: number): Promise<boolean> {
  return enqueue(() => scheduleNow(endsAt));
}

async function scheduleNow(endsAt: number): Promise<boolean> {
  if (!(await isNative())) return true;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    let permission = await LocalNotifications.checkPermissions();
    if (permission.display !== "granted") {
      permission = await LocalNotifications.requestPermissions();
    }
    if (permission.display !== "granted") return false;

    await ensureTimerChannel();
    await LocalNotifications.cancel({ notifications: [{ id: TIMER_NOTIFICATION_ID }] });
    await LocalNotifications.schedule({
      notifications: [
        {
          id: TIMER_NOTIFICATION_ID,
          title: "Time's up",
          body: "Your timer has finished.",
          channelId: TIMER_CHANNEL_ID,
          smallIcon: "ic_stat_timer",
          autoCancel: true,
          schedule: { at: new Date(endsAt), allowWhileIdle: true },
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

/** Cancels the pending notification and clears it from the notification shade. */
export function cancelTimerNotification(): Promise<void> {
  return enqueue(cancelNow);
}

async function cancelNow(): Promise<void> {
  if (!(await isNative())) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({ notifications: [{ id: TIMER_NOTIFICATION_ID }] });
    await LocalNotifications.removeAllDeliveredNotifications();
  } catch {
    // Ignore.
  }
}