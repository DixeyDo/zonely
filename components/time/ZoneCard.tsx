import type { SavedZone } from "@/lib/state";
import { formatClock, formatDayDifference, formatDifference } from "@/lib/format";
import {
  dayNumber,
  getOffsetMinutes,
  getShortZoneName,
  getZonedParts,
} from "@/lib/timezones";

type ZoneCardProps = {
  zone: SavedZone;
  now: number | null;
  hour12: boolean;
  localTimeZone: string;
  onPress: () => void;
};

export default function ZoneCard({ zone, now, hour12, localTimeZone, onPress }: ZoneCardProps) {
  const title = zone.label || zone.city;
  const subtitleCity = zone.label ? zone.city : null;

  let time = "--:--";
  let period: string | null = null;
  let difference = "";
  let day = "";
  let shortName = "";

  if (now !== null) {
    const parts = getZonedParts(now, zone.timeZone);
    const local = getZonedParts(now, localTimeZone);
    const clock = formatClock(parts.hour, parts.minute, hour12);
    time = clock.time;
    period = clock.period;
    const diff = getOffsetMinutes(zone.timeZone, now) - getOffsetMinutes(localTimeZone, now);
    const days = dayNumber(parts) - dayNumber(local);
    difference = formatDifference(diff);
    day = formatDayDifference(days);
    shortName = getShortZoneName(zone.timeZone, now);
  }

  return (
    <button
      type="button"
      onClick={onPress}
      className="flex w-full items-center justify-between gap-4 rounded-[26px] border border-line/60 bg-card px-5 py-4 text-left transition-transform duration-150 active:scale-[0.985] active:bg-elevated"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-[22px] font-semibold leading-tight tracking-tight text-ink">
            {title}
          </span>
          {shortName && shortName !== title && (
            <span className="shrink-0 rounded-md border border-line px-1.5 py-0.5 text-[11px] font-medium leading-none text-muted">
              {shortName}
            </span>
          )}
        </div>
        <p className="mt-1 truncate text-sm text-muted">
          {subtitleCity && <span className="text-ink/80">{subtitleCity} · </span>}
          {difference}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <div className="flex items-baseline gap-1">
          <span className="text-[38px] font-light leading-none tracking-tight tabular-nums text-ink">
            {time}
          </span>
          {period && <span className="text-sm font-medium text-muted">{period}</span>}
        </div>
        <span className={`mt-1 text-xs ${day === "Today" ? "text-faint" : "text-accent"}`}>
          {day}
        </span>
      </div>
    </button>
  );
}