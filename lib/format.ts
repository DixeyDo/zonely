export function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

/** 14, 5 → { time: "14:05", period: null } or { time: "2:05", period: "PM" } */
export function formatClock(
  hour: number,
  minute: number,
  hour12: boolean,
): { time: string; period: string | null } {
  if (!hour12) return { time: `${pad2(hour)}:${pad2(minute)}`, period: null };
  const period = hour < 12 ? "AM" : "PM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return { time: `${h}:${pad2(minute)}`, period };
}

/** Stopwatch: 83456 ms → { main: "01:23", fraction: "45" } (hours appear after 1 h). */
export function formatStopwatch(ms: number): { main: string; fraction: string } {
  const safe = Math.max(0, Math.floor(ms));
  const centis = Math.floor((safe % 1000) / 10);
  const totalSeconds = Math.floor(safe / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  const main =
    hours > 0
      ? `${hours}:${pad2(minutes)}:${pad2(seconds)}`
      : `${pad2(minutes)}:${pad2(seconds)}`;
  return { main, fraction: pad2(centis) };
}

/** Timer countdown: rounds UP so it shows 00:01 until the very end. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  return formatSeconds(totalSeconds);
}

/** 3725 → "1:02:05", 65 → "01:05" */
export function formatSeconds(totalSeconds: number): string {
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  return hours > 0
    ? `${hours}:${pad2(minutes)}:${pad2(seconds)}`
    : `${pad2(minutes)}:${pad2(seconds)}`;
}

/** Time difference in plain words: "9h ahead", "3h 30m behind", "Same time". */
export function formatDifference(diffMinutes: number): string {
  if (diffMinutes === 0) return "Same time";
  const abs = Math.abs(diffMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  const amount =
    hours > 0 && minutes > 0
      ? `${hours}h ${minutes}m`
      : hours > 0
        ? `${hours}h`
        : `${minutes}m`;
  return `${amount} ${diffMinutes > 0 ? "ahead" : "behind"}`;
}

/** Offset from UTC: 240 → "GMT+4", -210 → "GMT−3:30", 0 → "GMT" */
export function formatGmtOffset(offsetMinutes: number): string {
  if (offsetMinutes === 0) return "GMT";
  const sign = offsetMinutes > 0 ? "+" : "−";
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `GMT${sign}${hours}${minutes ? `:${pad2(minutes)}` : ""}`;
}

/** Calendar-day difference: 0 → "Today", 1 → "Tomorrow", -1 → "Yesterday". */
export function formatDayDifference(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return days > 0 ? `+${days} days` : `${days} days`;
}