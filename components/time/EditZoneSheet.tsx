"use client";

import { useState } from "react";
import Sheet from "../Sheet";
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "../Icons";
import { moveZone, removeZone, updateZoneLabel, zonesStore, type SavedZone } from "@/lib/state";
import { PRESETS } from "@/lib/zones-data";
import { getShortZoneName } from "@/lib/timezones";
import { tapHaptic } from "@/lib/device";

type EditZoneSheetProps = {
  zone: SavedZone;
  now: number | null;
  onClose: () => void;
};

export default function EditZoneSheet({ zone, now, onClose }: EditZoneSheetProps) {
  const zones = zonesStore.useValue();
  const [label, setLabel] = useState(zone.label);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const index = zones.findIndex((z) => z.id === zone.id);
  const isFirst = index <= 0;
  const isLast = index === zones.length - 1;

  const suggestions = [
    PRESETS.find((p) => p.timeZone === zone.timeZone)?.label,
    now !== null ? getShortZoneName(zone.timeZone, now) : undefined,
  ].filter((s): s is string => Boolean(s) && !s?.startsWith("GMT"));
  const uniqueSuggestions = [...new Set(suggestions)];

  function save() {
    updateZoneLabel(zone.id, label);
    void tapHaptic();
    onClose();
  }

  return (
    <Sheet title={zone.city} onClose={onClose} tall>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">Label</p>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
        }}
        placeholder={zone.city}
        maxLength={14}
        className="mt-2 w-full rounded-2xl border border-line bg-elevated px-4 py-3.5 text-lg text-ink outline-none placeholder:text-faint focus:border-accent"
      />
      {uniqueSuggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {uniqueSuggestions.map((s) => (
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
      <p className="mt-3 text-xs text-faint">{zone.timeZone}</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => moveZone(zone.id, -1)}
          className="flex items-center justify-center gap-2 rounded-full border border-line py-3 text-sm font-medium text-ink active:bg-elevated disabled:opacity-30"
        >
          <ChevronUpIcon size={18} /> Move up
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => moveZone(zone.id, 1)}
          className="flex items-center justify-center gap-2 rounded-full border border-line py-3 text-sm font-medium text-ink active:bg-elevated disabled:opacity-30"
        >
          <ChevronDownIcon size={18} /> Move down
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            if (!confirmDelete) {
              setConfirmDelete(true);
              return;
            }
            removeZone(zone.id);
            onClose();
          }}
          className={`flex items-center justify-center gap-2 rounded-full py-3.5 font-medium ${
            confirmDelete ? "bg-danger text-canvas" : "border border-danger/40 text-danger"
          }`}
        >
          <TrashIcon size={18} /> {confirmDelete ? "Tap to confirm" : "Delete"}
        </button>
        <button
          type="button"
          onClick={save}
          className="rounded-full bg-accent py-3.5 font-semibold text-canvas active:opacity-80"
        >
          Save
        </button>
      </div>
    </Sheet>
  );
}