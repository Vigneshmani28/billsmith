"use client";
import React from "react";
import { useAuth } from "@/context/auth-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { Toaster } from "@/components/ui/sonner";
import { ContentLoader } from "./loader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/70 z-50">
        <ContentLoader message="Loading invoices..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col px-4 py-2 sm:px-0 sm:py-0">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          {children}
        </main>
        <Footer />
        <ScrollToTopButton />
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
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
          <ScrollToTopButton />
          <Toaster position="top-right" />
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
