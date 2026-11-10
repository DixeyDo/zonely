import type { ReactNode } from "react";

type ProgressRingProps = {
  progress: number; // 0 → 1
  size?: number;
  stroke?: number;
  pulse?: boolean;
  children?: ReactNode;
};

export default function ProgressRing({
  progress,
  size = 300,
  stroke = 6,
  pulse = false,
  children,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const center = size / 2;

  return (
    <div
      className={`relative flex items-center justify-center ${pulse ? "animate-pulse-soft" : ""}`}
      style={{ width: size, height: size, maxWidth: "82vw", maxHeight: "82vw" }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 h-full w-full -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          opacity={clamped === 0 ? 0 : 1}
        />
      </svg>
      <div className="relative flex flex-col items-center">{children}</div>
    </div>
  );
}