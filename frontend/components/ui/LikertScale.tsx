"use client";

interface LikertScaleProps {
  name: string;
  label: string;
  value: number | null;
  onChange: (val: number) => void;
  points?: 5 | 7;
  reversed?: boolean;
  lowLabel?: string;
  highLabel?: string;
}

export function LikertScale({
  name,
  label,
  value,
  onChange,
  points = 7,
  reversed = false,
  lowLabel,
  highLabel,
}: LikertScaleProps) {
  const options = Array.from({ length: points }, (_, i) => i + 1);
  const leftLabel = lowLabel ?? (reversed ? "Strongly agree" : "Strongly disagree");
  const rightLabel = highLabel ?? (reversed ? "Strongly disagree" : "Strongly agree");

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--warm-brown)] leading-relaxed">{label}</p>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-[var(--warm-gray)] px-1">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
        <div className="flex gap-2 justify-between">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              aria-label={`${name}-${opt}`}
              onClick={() => onChange(opt)}
              className={`
                flex-1 h-10 rounded-xl text-sm font-medium border transition-all duration-150
                ${value === opt
                  ? "bg-[var(--sage)] text-white border-[var(--sage)] shadow-sm"
                  : "bg-white/60 text-[var(--warm-gray)] border-[var(--sage-light)]/40 hover:border-[var(--sage)] hover:text-[var(--warm-brown)]"
                }
              `}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
