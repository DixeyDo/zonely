export type ZonedParts = {
  year: number;
  month: number; // 1–12
  day: number;
  hour: number; // 0–23
  minute: number;
  second: number;
};

const partFormatters = new Map<string, Intl.DateTimeFormat>();
const nameFormatters = new Map<string, Intl.DateTimeFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function getPartFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = partFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    partFormatters.set(timeZone, formatter);
  }
  return formatter;
}

/** The wall-clock date and time in `timeZone` at the instant `timestamp`. */
export function getZonedParts(timestamp: number, timeZone: string): ZonedParts {
  const parts = getPartFormatter(timeZone).formatToParts(timestamp);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour") % 24,
    minute: pick("minute"),
    second: pick("second"),
  };
}

/** Offset from UTC in minutes, e.g. Dubai → 240, New York in winter → -300. */
export function getOffsetMinutes(timeZone: string, timestamp: number): number {
  const p = getZonedParts(timestamp, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const wholeSecond = timestamp - (((timestamp % 1000) + 1000) % 1000);
  return Math.round((asUtc - wholeSecond) / 60000);
}

/** Days since 1970 for a calendar date (used to compare "today" vs "tomorrow"). */
export function dayNumber(parts: ZonedParts): number {
  return Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / 86400000);
}

/** Converts a wall-clock time in a zone (e.g. 00:00 on 11 Nov in New York) to a timestamp. */
export function zonedTimeToTimestamp(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): number {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const firstOffset = getOffsetMinutes(timeZone, guess);
  let timestamp = guess - firstOffset * 60000;
  const secondOffset = getOffsetMinutes(timeZone, timestamp);
  if (secondOffset !== firstOffset) timestamp = guess - secondOffset * 60000;
  return timestamp;
}

/** Short zone name such as "EST", "PDT" or "GMT+4". */
export function getShortZoneName(timeZone: string, timestamp: number): string {
  let formatter = nameFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" });
    nameFormatters.set(timeZone, formatter);
  }
  return (
    formatter.formatToParts(timestamp).find((part) => part.type === "timeZoneName")
      ?.value ?? ""
  );
}

/** "Tuesday 10 November" (style "long") or "Tue 10 Nov" (style "short"). */
export function formatZonedDate(
  timestamp: number,
  timeZone: string,
  style: "long" | "short",
): string {
  const key = `${timeZone}|${style}`;
  let formatter = dateFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      weekday: style,
      day: "numeric",
      month: style,
    });
    dateFormatters.set(key, formatter);
  }
  return formatter.format(timestamp).replace(",", "");
}

export function getLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

/** "America/Argentina/Buenos_Aires" → "Buenos Aires" */
export function cityFromTimeZone(timeZone: string): string {
  const last = timeZone.split("/").pop() ?? timeZone;
  return last.replace(/_/g, " ");
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** Every IANA time zone the phone knows about. */
export function getAllTimeZones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return [];
  }
}

/** Whether this device's language normally uses a 12-hour clock. */
export function deviceUses12Hour(): boolean {
  try {
    const options = new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions();
    return options.hour12 ?? false;
  } catch {
    return false;
  }
}