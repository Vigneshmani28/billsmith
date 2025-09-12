"use client";

import { FileText } from "lucide-react";

export function ContentLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[200px]"
      role="status"
      aria-label={message}
    >
      <div className="relative w-16 h-16 mb-3">
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>

        {/* Centered billing icon */}
        <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
