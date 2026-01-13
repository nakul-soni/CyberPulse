"use client";

import { useState } from "react";

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

  const label =
    status === "loading"
      ? "Refreshing..."
      : status === "done"
      ? "Refreshed!"
      : status === "error"
      ? "Retry?"
      : "Refresh News";

  return (
    <button
      onClick={handleRefresh}
      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
        status === "loading"
          ? "bg-blue-100 text-blue-700 cursor-wait"
          : status === "error"
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : status === "done"
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-blue-50 text-blue-700 hover:bg-blue-100"
      }`}
      disabled={status === "loading"}
      aria-busy={status === "loading"}
    >
      {label}
    </button>
  );
}

