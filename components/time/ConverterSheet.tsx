"use client";

import { useState } from "react";
import Sheet from "../Sheet";
import type { SavedZone } from "@/lib/state";
import { formatClock, pad2 } from "@/lib/format";
import {
  cityFromTimeZone,
  formatZonedDate,
  getZonedParts,
  zonedTimeToTimestamp,
} from "@/lib/timezones";

type ConverterSheetProps = {
  now: number;
  zones: SavedZone[];
  localTimeZone: string;
  hour12: boolean;
  onClose: () => void;
};

type Row = { key: string; title: string; subtitle: string; timeZone: string };

function toInputs(timestamp: number, timeZone: string) {
  const p = getZonedParts(timestamp, timeZone);
  return {
    date: `${p.year}-${pad2(p.month)}-${pad2(p.day)}`,
    time: `${pad2(p.hour)}:${pad2(p.minute)}`,
  };
}

export default function ConverterSheet({
  now,
  zones,
  localTimeZone,
  hour12,
  onClose,
}: ConverterSheetProps) {
  const rows: Row[] = [
    {
      key: "local",
      title: "Local time",
      subtitle: cityFromTimeZone(localTimeZone),
      timeZone: localTimeZone,
    },
    ...zones.map((z) => ({
      key: z.id,
      title: z.label || z.city,
      subtitle: z.label ? z.city : "",
      timeZone: z.timeZone,
    })),
  ];

  const [sourceKey, setSourceKey] = useState(zones[0]?.id ?? "local");
  const source = rows.find((r) => r.key === sourceKey) ?? rows[0];
  const [inputs, setInputs] = useState(() => toInputs(now, source.timeZone));

  const [y, mo, d] = inputs.date.split("-").map(Number);
  const [h, mi] = inputs.time.split(":").map(Number);
  const valid = [y, mo, d, h, mi].every((n) => Number.isFinite(n));
  const instant = valid ? zonedTimeToTimestamp(y, mo, d, h, mi, source.timeZone) : null;

  function changeSource(key: string) {
    const next = rows.find((r) => r.key === key) ?? rows[0];
    // Keep the same moment in time, shown in the newly selected zone.
    if (instant !== null) setInputs(toInputs(instant, next.timeZone));
    setSourceKey(key);
  }

  return (
    <Sheet title="Convert a time" onClose={onClose}>
      <p className="text-sm text-muted">
        Saw &quot;12:00 AM ET&quot;? Pick ET, type the time, and see it everywhere.
      </p>

      <div className="mt-4 rounded-3xl border border-line bg-elevated p-4">
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-faint">
          Time in
        </label>
        <select
          value={sourceKey}
          onChange={(e) => changeSource(e.target.value)}
          className="mt-2 w-full rounded-xl border border-line bg-card px-3 py-3 text-base text-ink outline-none focus:border-accent"
        >
          {rows.map((r) => (
            <option key={r.key} value={r.key}>
              {r.subtitle ? `${r.title} — ${r.subtitle}` : r.title}
            </option>
          ))}
        </select>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <input
            type="time"
            value={inputs.time}
            onChange={(e) => setInputs((v) => ({ ...v, time: e.target.value }))}
            className="w-full rounded-xl border border-line bg-card px-3 py-3 text-lg tabular-nums text-ink outline-none focus:border-accent"
          />
          <input
            type="date"
            value={inputs.date}
            onChange={(e) => setInputs((v) => ({ ...v, date: e.target.value }))}
            className="w-full rounded-xl border border-line bg-card px-3 py-3 text-base text-ink outline-none focus:border-accent"
          />
        </div>
        <button
          type="button"
          onClick={() => setInputs(toInputs(Date.now(), source.timeZone))}
          className="mt-3 text-sm font-medium text-accent"
        >
          Reset to now
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {rows
          .filter((r) => r.key !== source.key)
          .map((r) => {
            if (instant === null) return null;
            const p = getZonedParts(instant, r.timeZone);
            const clock = formatClock(p.hour, p.minute, hour12);
            return (
              <li
                key={r.key}
                className="flex items-center justify-between gap-3 rounded-2xl border border-line/60 bg-card px-4 py-3"
              >
                <span className="min-w-0">
                  <span className="block truncate text-base font-semibold text-ink">{r.title}</span>
                  <span className="block truncate text-xs text-muted">
                    {r.subtitle ? `${r.subtitle} · ` : ""}
                    {formatZonedDate(instant, r.timeZone, "short")}
                  </span>
                </span>
                <span className="flex shrink-0 items-baseline gap-1">
                  <span className="text-3xl font-light tabular-nums text-ink">{clock.time}</span>
                  {clock.period && <span className="text-xs text-muted">{clock.period}</span>}
                </span>
              </li>
            );
          })}
      </ul>
      {zones.length === 0 && (
        <p className="mt-4 text-center text-sm text-muted">
          Add some time zones first to compare them here.
        </p>
      )}
    </Sheet>
  );
}