"use client";

import { useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

const DEBUG_KEY = process.env.NEXT_PUBLIC_DEBUG_KEY ?? "";

export function DebugGuard({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const provided = params.get("key") ?? "";

  if (!DEBUG_KEY || provided !== DEBUG_KEY) {
    return (
      <div className="healing-bg min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-sm w-full text-center space-y-4">
          <Lock className="w-8 h-8 text-[var(--warm-gray)] mx-auto" />
          <p className="text-sm text-[var(--warm-gray)]">
            Debug access requires a valid key.<br />
            Append <code className="text-xs bg-black/5 px-1 py-0.5 rounded">?key=…</code> to the URL.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
