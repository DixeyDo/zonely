"use client";

import type { ComponentType } from "react";
import { GlobeIcon, HourglassIcon, StopwatchIcon } from "./Icons";
import { tapHaptic } from "@/lib/device";

export type TabId = "time" | "stopwatch" | "timer";

const TABS: { id: TabId; label: string; Icon: ComponentType<{ size?: number }> }[] = [
  { id: "time", label: "Time", Icon: GlobeIcon },
  { id: "stopwatch", label: "Stopwatch", Icon: StopwatchIcon },
  { id: "timer", label: "Timer", Icon: HourglassIcon },
];

type TabBarProps = {
  active: TabId;
  onChange: (tab: TabId) => void;
  badges: Partial<Record<TabId, boolean>>;
};

export default function TabBar({ active, onChange, badges }: TabBarProps) {
  return (
    <nav className="pb-safe shrink-0 border-t border-line/70 bg-canvas/95 backdrop-blur-xl">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-2 pb-2">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = id === active;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => {
                  if (!isActive) void tapHaptic();
                  onChange(id);
                }}
                aria-current={isActive ? "page" : undefined}
                className="flex w-full flex-col items-center gap-1 py-1"
              >
                <span
                  className={`relative flex h-8 w-16 items-center justify-center rounded-full transition-colors duration-200 ${
                    isActive ? "bg-accent/15 text-accent" : "text-muted"
                  }`}
                >
                  <Icon size={22} />
                  {badges[id] && !isActive && (
                    <span className="absolute right-4 top-1 h-2 w-2 rounded-full bg-accent" />
                  )}
                </span>
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? "text-ink" : "text-muted"
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}