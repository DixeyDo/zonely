"use client";

import { useState } from "react";
import AnalogClock from "./AnalogClock";
import ZoneCard from "./ZoneCard";
import AddZoneSheet from "./AddZoneSheet";
import EditZoneSheet from "./EditZoneSheet";
import ConverterSheet from "./ConverterSheet";
import { ConvertIcon, PlusIcon } from "../Icons";
import { useSecondClock } from "@/lib/clock";
import { addZone, settingsStore, zonesStore } from "@/lib/state";
import { PRESETS } from "@/lib/zones-data";
import { formatClock, formatGmtOffset, pad2 } from "@/lib/format";
import {
  cityFromTimeZone,
  deviceUses12Hour,
  formatZonedDate,
  getLocalTimeZone,
  getOffsetMinutes,
  getZonedParts,
} from "@/lib/timezones";
import { tapHaptic } from "@/lib/device";

type OpenSheet = { kind: "add" } | { kind: "convert" } | { kind: "edit"; id: string } | null;

const QUICK_PRESETS = ["ET", "CT", "PT", "UTC", "UK", "JST"];

export default function TimeTab() {
  const now = useSecondClock();
  const zones = zonesStore.useValue();
  const settings = settingsStore.useValue();
  const [sheet, setSheet] = useState<OpenSheet>(null);

  const ready = now !== null;
  const localTimeZone = ready ? getLocalTimeZone() : "UTC";
  const hour12 = settings.hour12 ?? (ready ? deviceUses12Hour() : false);

  const local = ready ? getZonedParts(now, localTimeZone) : null;
  const clock = local ? formatClock(local.hour, local.minute, hour12) : null;
  const editing = sheet?.kind === "edit" ? zones.find((z) => z.id === sheet.id) : undefined;

  return (
    <div className="h-full overflow-y-auto overscroll-contain">
      <div className="pt-safe mx-auto max-w-md px-5 pb-8">
        {/* Header */}
        <header className="flex items-center justify-between pb-2 pt-3">
          <h1 className="text-[15px] font-semibold tracking-wide text-muted">Zonely</h1>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => settingsStore.set((s) => ({ ...s, hour12: !hour12 }))}
              className="h-10 rounded-full px-3 text-sm font-semibold text-muted active:bg-elevated"
              aria-label="Switch between 12-hour and 24-hour time"
            >
              {hour12 ? "12h" : "24h"}
            </button>
            <button
              type="button"
              onClick={() => setSheet({ kind: "convert" })}
              disabled={!ready}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink active:bg-elevated"
              aria-label="Convert a time"
            >
              <ConvertIcon size={21} />
            </button>
            <button
              type="button"
              onClick={() => setSheet({ kind: "add" })}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink active:bg-elevated"
              aria-label="Add a time zone"
            >
              <PlusIcon size={24} />
            </button>
          </div>
        </header>

        {/* Big local clock (tap to switch analog/digital) */}
        <button
          type="button"
          onClick={() => {
            void tapHaptic();
            settingsStore.set((s) => ({ ...s, analog: !s.analog }));
          }}
          className="flex w-full flex-col items-center pb-8 pt-6"
          aria-label="Switch between analog and digital clock"
        >
          {settings.analog && local ? (
            <AnalogClock hour={local.hour} minute={local.minute} second={local.second} />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-[88px] font-extralight leading-none tracking-[-0.04em] tabular-nums text-ink">
                {clock ? clock.time : "--:--"}
              </span>
              <span className="flex flex-col items-start gap-1">
                {clock?.period && (
                  <span className="text-lg font-medium text-muted">{clock.period}</span>
                )}
                <span className="text-2xl font-light tabular-nums text-accent">
                  {local ? pad2(local.second) : "--"}
                </span>
              </span>
            </div>
          )}
          <p className="mt-5 text-base text-ink/90">
            {ready ? formatZonedDate(now, localTimeZone, "long") : "\u00A0"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {ready
              ? `${cityFromTimeZone(localTimeZone)} · ${formatGmtOffset(getOffsetMinutes(localTimeZone, now))}`
              : "\u00A0"}
          </p>
        </button>

        {/* World clocks */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
            World clocks
          </h2>
          {zones.length > 0 && (
            <span className="text-xs text-faint">Tap a clock to rename it</span>
          )}
        </div>

        {zones.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-line px-5 py-6">
            <p className="text-base font-medium text-ink">No time zones yet</p>
            <p className="mt-1 text-sm text-muted">
              Add the zones companies use for release times. They come already labelled.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_PRESETS.map((label) => {
                const preset = PRESETS.find((p) => p.label === label);
                if (!preset) return null;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      void tapHaptic();
                      addZone(preset.timeZone, preset.city, preset.label);
                    }}
                    className="rounded-full border border-line bg-elevated px-4 py-2 text-sm font-semibold text-ink active:scale-95"
                  >
                    + {label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {zones.map((zone) => (
              <li key={zone.id}>
                <ZoneCard
                  zone={zone}
                  now={now}
                  hour12={hour12}
                  localTimeZone={localTimeZone}
                  onPress={() => setSheet({ kind: "edit", id: zone.id })}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {sheet?.kind === "add" && (
        <AddZoneSheet now={now} hour12={hour12} onClose={() => setSheet(null)} />
      )}
      {sheet?.kind === "convert" && ready && (
        <ConverterSheet
          now={now}
          zones={zones}
          localTimeZone={localTimeZone}
          hour12={hour12}
          onClose={() => setSheet(null)}
        />
      )}
      {editing && <EditZoneSheet zone={editing} now={now} onClose={() => setSheet(null)} />}
    </div>
  );
}