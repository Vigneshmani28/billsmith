"use client";

import { Loader2 } from "lucide-react";

export function ContentLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div
      className="flex items-center justify-center min-h-[200px]" // takes some height but not whole screen
      role="status"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
