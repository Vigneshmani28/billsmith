import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { InvoiceProvider } from "@/context/invoice-context";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/Footer";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            <Navbar />
            <main className="flex-1">{children}</main>
            <Toaster position="top-right" />
            <Footer />
          </body>
        </InvoiceProvider>
      </html>
    </ClerkProvider>
  );
}
