"use client";

import { useState } from "react";

export default function ReanalyzeButton({ incidentId }: { incidentId: string }) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      setStatus("loading");
      setMessage(null);
      const res = await fetch(`/api/reanalyze/${incidentId}`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Reanalyze failed");
      }
      setStatus("done");
      setMessage("Re-analysis started. Refresh in a moment.");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Re-analyze failed. Try again later.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const label =
    status === "loading"
      ? "Re-analyzing..."
      : status === "done"
      ? "Queued"
      : status === "error"
      ? "Retry"
      : "Retry AI Analysis";

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
          status === "loading"
            ? "bg-blue-100 text-blue-700 cursor-wait"
            : status === "error"
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : status === "done"
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
        }`}
      >
        {label}
      </button>
      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  );
}

