"use client";

import { useState } from "react";
import { RefreshCw, Check, AlertCircle } from "lucide-react";

export default function RefreshButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleRefresh = async () => {
    try {
      setStatus("loading");
      const res = await fetch("/api/ingest", { method: "GET" });
      if (!res.ok) throw new Error("Failed to ingest");
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border
        ${status === "loading"
          ? "bg-[var(--accent-blue)]/10 border-[var(--accent-blue)]/30 text-[var(--accent-cyan)] cursor-wait"
          : status === "error"
          ? "bg-[var(--severity-high)]/10 border-[var(--severity-high)]/30 text-[var(--severity-high)] hover:bg-[var(--severity-high)]/20"
          : status === "done"
          ? "bg-[var(--severity-low)]/10 border-[var(--severity-low)]/30 text-[var(--severity-low)]"
          : "bg-[var(--bg-card)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--accent-blue)]/50 hover:text-[var(--accent-cyan)] hover:bg-[var(--accent-blue)]/5"
        }
      `}
      disabled={status === "loading"}
      aria-busy={status === "loading"}
    >
      {status === "loading" ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Refreshing...</span>
        </>
      ) : status === "done" ? (
        <>
          <Check className="w-4 h-4" />
          <span>Updated!</span>
        </>
      ) : status === "error" ? (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>Retry</span>
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </>
      )}
    </button>
  );
}
