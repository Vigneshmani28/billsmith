"use client";

import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="w-full px-4 sm:px-6 lg:px-8">
      <Separator className="mb-4" />
      <div className="flex flex-col items-center justify-center text-sm text-muted-foreground py-4 space-y-1">
        <p className="text-center mt-2">
          &copy; {new Date().getFullYear()} InvoiceApp. All rights reserved.
        </p>
        <p className="text-center">
          Developed by{" "}
          <a
            href="https://vigneshdev.in"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            Vigneshwaran
          </a>
        </p>
      </div>
    </footer>
  );
}
