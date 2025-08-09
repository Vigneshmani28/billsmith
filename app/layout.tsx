import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { InvoiceProvider } from "@/context/invoice-context";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/Footer";

// shadcn/ui sidebar imports
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthLayout from "@/components/AuthLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BillSmith",
  description: "Create, manage, and save invoices effortlessly",
  openGraph: {
    title: "BillSmith",
    description: "Create, manage, and save invoices effortlessly",
    url: "https://billsmith.vercel.app",
    siteName: "BillSmith",
    images: [
      {
        url: "/preview-logo.png", // This should exist in /public
        width: 1200,
        height: 630,
        alt: "BillSmith Invoice App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BillSmith",
    description: "Create, manage, and save invoices effortlessly",
    images: ["/preview-logo.png"],
  },
};


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <InvoiceProvider>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            <AuthLayout>{children}</AuthLayout>
          </body>
        </InvoiceProvider>
      </html>
    </ClerkProvider>
  );
}
