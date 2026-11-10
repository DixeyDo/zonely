type AnalogClockProps = {
  hour: number;
  minute: number;
  second: number;
};

const TICKS = Array.from({ length: 60 }, (_, i) => i);

export default function AnalogClock({ hour, minute, second }: AnalogClockProps) {
  const secondAngle = second * 6;
  const minuteAngle = minute * 6 + second * 0.1;
  const hourAngle = (hour % 12) * 30 + minute * 0.5;

  return (
    <svg viewBox="0 0 200 200" className="h-[232px] w-[232px]" role="img" aria-label="Analog clock">
      <circle cx="100" cy="100" r="96" fill="var(--color-card)" />
      <circle cx="100" cy="100" r="96" fill="none" stroke="var(--color-line)" strokeWidth="1" />
      {TICKS.map((i) => {
        const isHour = i % 5 === 0;
        return (
          <line
            key={i}
            x1="100"
            y1={isHour ? 12 : 14}
            x2="100"
            y2={isHour ? 22 : 17}
            stroke={isHour ? "var(--color-ink)" : "var(--color-faint)"}
            strokeWidth={isHour ? 2.2 : 1}
            strokeLinecap="round"
            transform={`rotate(${i * 6} 100 100)`}
          />
        );
      })}
      <line
        x1="100" y1="100" x2="100" y2="54"
        stroke="var(--color-ink)" strokeWidth="5" strokeLinecap="round"
        transform={`rotate(${hourAngle} 100 100)`}
      />
      <line
        x1="100" y1="100" x2="100" y2="32"
        stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round"
        transform={`rotate(${minuteAngle} 100 100)`}
      />
      <line
        x1="100" y1="116" x2="100" y2="26"
        stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round"
        transform={`rotate(${secondAngle} 100 100)`}
      />
      <circle cx="100" cy="100" r="4.5" fill="var(--color-accent)" />
      <circle cx="100" cy="100" r="1.8" fill="var(--color-card)" />
    </svg>
  );
}