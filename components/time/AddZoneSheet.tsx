"use client";

import { useMemo, useState } from "react";
import Sheet from "../Sheet";
import { SearchIcon } from "../Icons";
import { addZone, zonesStore } from "@/lib/state";
import { CITIES, PRESETS, type CityEntry } from "@/lib/zones-data";
import { formatClock } from "@/lib/format";
import {
  cityFromTimeZone,
  getAllTimeZones,
  getShortZoneName,
  getZonedParts,
} from "@/lib/timezones";
import { tapHaptic } from "@/lib/device";

type SearchEntry = CityEntry & { search: string };

let searchIndex: SearchEntry[] | null = null;

function normalize(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function getSearchIndex(): SearchEntry[] {
  if (searchIndex) return searchIndex;
  const curatedZones = new Set(CITIES.map((c) => c.timeZone));
  const extra: CityEntry[] = getAllTimeZones()
    .filter((tz) => !curatedZones.has(tz) && tz.includes("/"))
    .map((tz) => ({
      city: cityFromTimeZone(tz),
      country: tz.split("/").slice(0, -1).join(" / ").replace(/_/g, " "),
      timeZone: tz,
    }));
  searchIndex = [...CITIES, ...extra].map((entry) => ({
    ...entry,
    search: normalize(`${entry.city} ${entry.country} ${entry.timeZone}`),
  }));
  return searchIndex;
}

function searchZones(query: string): SearchEntry[] {
  const q = normalize(query.trim());
  if (!q) return [];
  const ranked: { entry: SearchEntry; rank: number }[] = [];
  for (const entry of getSearchIndex()) {
    const city = normalize(entry.city);
    const keywordHit = entry.keywords?.some((k) => normalize(k) === q);
    let rank = -1;
    if (keywordHit) rank = 0;
    else if (city.startsWith(q)) rank = 1;
    else if (city.includes(q)) rank = 2;
    else if (entry.keywords?.some((k) => normalize(k).startsWith(q))) rank = 3;
    else if (entry.search.includes(q)) rank = 4;
    if (rank >= 0) ranked.push({ entry, rank });
  }
  ranked.sort((a, b) => a.rank - b.rank || a.entry.city.localeCompare(b.entry.city));
  return ranked.slice(0, 50).map((r) => r.entry);
}

function labelSuggestions(timeZone: string, now: number | null): string[] {
  const suggestions: string[] = [];
  const preset = PRESETS.find((p) => p.timeZone === timeZone);
  if (preset) suggestions.push(preset.label);
  for (const city of CITIES) {
    if (city.timeZone !== timeZone) continue;
    for (const k of city.keywords ?? []) {
      if (k.length <= 5 && k === k.toUpperCase()) suggestions.push(k);
    }
  }
  if (now !== null) {
    const short = getShortZoneName(timeZone, now);
    if (short && !short.startsWith("GMT")) suggestions.push(short);
  }
  return [...new Set(suggestions)].slice(0, 5);
}

type AddZoneSheetProps = {
  now: number | null;
  hour12: boolean;
  onClose: () => void;
};

export default function AddZoneSheet({ now, hour12, onClose }: AddZoneSheetProps) {
  const zones = zonesStore.useValue();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<CityEntry | null>(null);
  const [label, setLabel] = useState("");

  const results = useMemo(() => searchZones(query), [query]);

  function timeIn(timeZone: string): string {
    if (now === null) return "";
    const p = getZonedParts(now, timeZone);
    const clock = formatClock(p.hour, p.minute, hour12);
    return clock.period ? `${clock.time} ${clock.period}` : clock.time;
  }

  if (picked) {
    const suggestions = labelSuggestions(picked.timeZone, now);
    return (
      <Sheet title={`Label ${picked.city}`} onClose={onClose} tall>
        <p className="text-sm text-muted">
          Give it a short name you&apos;ll recognise, like <span className="text-ink">ET</span>.
          Leave it empty to show the city name.
        </p>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={picked.city}
          maxLength={14}
          autoFocus
          className="mt-4 w-full rounded-2xl border border-line bg-elevated px-4 py-3.5 text-lg text-ink outline-none placeholder:text-faint focus:border-accent"
        />
        {suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setLabel(s)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                  label === s ? "border-accent bg-accent/15 text-accent" : "border-line text-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPicked(null)}
            className="rounded-full border border-line py-3.5 font-medium text-ink active:bg-elevated"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              addZone(picked.timeZone, picked.city, label);
              void tapHaptic();
              onClose();
            }}
            className="rounded-full bg-accent py-3.5 font-semibold text-canvas active:opacity-80"
          >
            Add
          </button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet title="Add a time zone" onClose={onClose} tall>
      <label className="flex items-center gap-3 rounded-2xl border border-line bg-elevated px-4 py-3 focus-within:border-accent">
        <SearchIcon size={18} className="text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city, country or ET, PT…"
          className="w-full bg-transparent text-base text-ink outline-none placeholder:text-faint"
        />
      </label>

      {query.trim() === "" ? (
        <>
          <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-faint">
            Quick add · already labelled
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => {
              const added = zones.some(
                (z) => z.timeZone === preset.timeZone && z.label === preset.label,
              );
              return (
                <button
                  key={preset.label}
                  type="button"
                  disabled={added}
                  onClick={() => {
                    addZone(preset.timeZone, preset.city, preset.label);
                    void tapHaptic();
                    onClose();
                  }}
                  className="flex flex-col items-start rounded-2xl border border-line bg-elevated px-3.5 py-3 text-left transition active:scale-[0.97] disabled:opacity-35"
                >
                  <span className="text-lg font-semibold leading-tight text-ink">{preset.label}</span>
                  <span className="mt-0.5 text-[11px] leading-tight text-muted">
                    {added ? "Added" : preset.description}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-5 text-sm text-muted">
            Or search for any city and give it your own label.
          </p>
        </>
      ) : (
        <ul className="mt-3 divide-y divide-line/60">
          {results.length === 0 && (
            <li className="py-6 text-center text-sm text-muted">
              No matches. Try a city or country name.
            </li>
          )}
          {results.map((entry) => (
            <li key={`${entry.city}-${entry.timeZone}`}>
              <button
                type="button"
                onClick={() => {
                  setPicked(entry);
                  setLabel(PRESETS.find((p) => p.timeZone === entry.timeZone)?.label ?? "");
                }}
                className="flex w-full items-center justify-between gap-3 py-3.5 text-left active:opacity-60"
              >
                <span className="min-w-0">
                  <span className="block truncate text-base text-ink">{entry.city}</span>
                  <span className="block truncate text-xs text-muted">
                    {entry.country}
                    {now !== null && ` · ${getShortZoneName(entry.timeZone, now)}`}
                  </span>
                </span>
                <span className="shrink-0 text-base tabular-nums text-muted">
                  {timeIn(entry.timeZone)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}