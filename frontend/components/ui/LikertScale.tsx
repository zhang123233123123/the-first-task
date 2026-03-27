"use client";

interface LikertScaleProps {
  name: string;
  label: string;
  value: number | null;
  onChange: (val: number) => void;
  points?: 5 | 7;
  reversed?: boolean;
}

export function LikertScale({
  name,
  label,
  value,
  onChange,
  points = 7,
  reversed = false,
}: LikertScaleProps) {
  const options = Array.from({ length: points }, (_, i) => i + 1);

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--warm-brown)] leading-relaxed">{label}</p>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-[var(--warm-gray)] px-1">
          <span>{reversed ? "Strongly agree" : "Strongly disagree"}</span>
          <span>{reversed ? "Strongly disagree" : "Strongly agree"}</span>
        </div>
        <div className="flex gap-2 justify-between">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
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
