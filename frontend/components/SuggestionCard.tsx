"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb, AlertTriangle, ArrowRight, HelpCircle } from "lucide-react";

interface Provocateur {
  risk: string;
  alternative: string;
  question: string;
}

interface SuggestionCardProps {
  id: number;
  suggestion: string;
  provocateur?: Provocateur;
  showProvocateur: boolean;
  selected: boolean;
  onSelect: () => void;
}

export function SuggestionCard({
  id,
  suggestion,
  provocateur,
  showProvocateur,
  selected,
  onSelect,
}: SuggestionCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`
        glass-card p-5 cursor-pointer transition-all duration-200
        ${selected
          ? "ring-2 ring-[var(--sage)] shadow-lg shadow-[var(--sage)]/10"
          : "hover:shadow-md hover:-translate-y-0.5"
        }
      `}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`
          mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
          ${selected
            ? "bg-[var(--sage)] border-[var(--sage)]"
            : "border-[var(--sage-light)] bg-white"
          }
        `}>
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
        </div>
        <div className="flex-1">
          <p className="text-[var(--warm-gray)] text-xs font-medium mb-1 uppercase tracking-wide">
            Direction {id}
          </p>
          <p className="text-[var(--warm-brown)] text-sm leading-relaxed">{suggestion}</p>
        </div>
        <Lightbulb className="w-4 h-4 text-[var(--peach)] flex-shrink-0 mt-0.5" />
      </div>

      {/* Provocateur card */}
      {showProvocateur && provocateur && (
        <div className="mt-4 border-t border-[var(--lavender-light)]/50 pt-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--lavender)] hover:text-[var(--warm-brown)] transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? "Hide challenge" : "View challenge"}
          </button>

          {expanded && (
            <div className="mt-3 space-y-3 rounded-2xl bg-[var(--lavender-light)]/30 p-4 border border-[var(--lavender-light)]/50">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--peach)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[var(--warm-gray)] uppercase tracking-wide mb-0.5">Risk</p>
                  <p className="text-sm text-[var(--warm-brown)]">{provocateur.risk}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <ArrowRight className="w-4 h-4 text-[var(--sage)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[var(--warm-gray)] uppercase tracking-wide mb-0.5">Alternative</p>
                  <p className="text-sm text-[var(--warm-brown)]">{provocateur.alternative}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--lavender)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[var(--warm-gray)] uppercase tracking-wide mb-0.5">Question</p>
                  <p className="text-sm text-[var(--warm-brown)] italic">{provocateur.question}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
