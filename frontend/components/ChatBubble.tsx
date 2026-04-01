"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ChatBubbleProps {
  role: "ai" | "user";
  children: React.ReactNode;
  id?: string;
  highlight?: boolean;
}

export function ChatBubble({ role, children, id, highlight }: ChatBubbleProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlight && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlight]);

  return (
    <motion.div
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          max-w-[88%] px-3 py-2 text-sm leading-relaxed text-[var(--warm-brown)]
          transition-all duration-300
          ${
            role === "ai"
              ? "bg-white/60 border border-[var(--sage-light)]/40 rounded-2xl rounded-tl-sm"
              : "bg-[var(--sage-light)]/50 rounded-2xl rounded-tr-sm"
          }
          ${highlight ? "ring-2 ring-[var(--lavender)]/60 shadow-md" : ""}
        `}
      >
        {children}
      </div>
    </motion.div>
  );
}
