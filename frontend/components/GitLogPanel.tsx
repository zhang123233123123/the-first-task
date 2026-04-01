"use client";

import { motion } from "framer-motion";
import { GitBranch } from "lucide-react";

export interface GitLogEntry {
  id: string;
  label: string;
  type: "suggestion" | "provocation" | "friction";
}

interface GitLogPanelProps {
  entries: GitLogEntry[];
  activeId?: string;
  onSelect: (id: string) => void;
}

const TYPE_COLORS: Record<GitLogEntry["type"], string> = {
  suggestion: "bg-[var(--sage)]",
  provocation: "bg-[var(--lavender)]",
  friction: "bg-[var(--peach)]",
};

export function GitLogPanel({ entries, activeId, onSelect }: GitLogPanelProps) {
  if (entries.length === 0) return null;

  return (
    <aside className="glass-card flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-4 pb-2 border-b border-[var(--sage-light)]/20 flex items-center gap-2 flex-shrink-0">
        <GitBranch className="w-3.5 h-3.5 text-[var(--sage)]" />
        <p className="text-xs font-medium text-[var(--warm-gray)] uppercase tracking-wide">
          History
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {entries.map((entry, i) => (
          <motion.button
            key={entry.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            type="button"
            onClick={() => onSelect(entry.id)}
            className={`
              w-full flex items-start gap-2.5 px-2 py-2 rounded-xl text-left
              transition-colors duration-150 group
              ${
                activeId === entry.id
                  ? "bg-[var(--sage-light)]/30"
                  : "hover:bg-white/40"
              }
            `}
          >
            <div className="flex flex-col items-center flex-shrink-0 mt-1.5">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${TYPE_COLORS[entry.type]}`} />
              {i < entries.length - 1 && (
                <div className="w-px flex-1 min-h-[14px] bg-[var(--warm-gray)]/20 mt-1" />
              )}
            </div>
            <p
              className={`
                text-xs leading-snug line-clamp-2 flex-1
                ${
                  activeId === entry.id
                    ? "text-[var(--warm-brown)] font-medium"
                    : "text-[var(--warm-gray)] group-hover:text-[var(--warm-brown)]"
                }
              `}
            >
              {entry.label}
            </p>
          </motion.button>
        ))}
      </div>
    </aside>
  );
}
