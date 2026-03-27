"use client";

interface ProgressBarProps {
  step: number;   // current step (1-based)
  total: number;  // total steps
  label?: string;
}

export function ProgressBar({ step, total, label }: ProgressBarProps) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex justify-between text-xs text-[var(--warm-gray)]">
          <span>{label}</span>
          <span>{step} / {total}</span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-[var(--sage-light)]/30 overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--sage)] transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
