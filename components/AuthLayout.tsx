"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null;

  return (
    <>
      {isSignedIn ? (
        <SidebarProvider>
          <TooltipProvider delayDuration={200}>
            <AppSidebar />
            <div className="flex-1 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 p-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarTrigger className="mb-4" />
                  </TooltipTrigger>
                  <TooltipContent side="right">Toggle sidebar</TooltipContent>
                </Tooltip>
                {children}
              </main>
              <Footer />
            </div>
          </TooltipProvider>
        </SidebarProvider>
      ) : (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 p-4">{children}</main>
          <Footer />
        </div>
      )}

      {/* Floating Scroll to Top Button */}
      <ScrollToTopButton />

      {/* Notifications */}
      <Toaster position="top-right" />
    </>
  );
}
