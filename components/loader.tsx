"use client";

import { Loader2 } from "lucide-react";

export function FullPageLoader() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
      role="status"
      aria-label="Loading application"
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading invoice...</p>
      </div>
    </div>
  );
}
