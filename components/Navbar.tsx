"use client";

import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="block">
            <div className="relative w-24 h-24">
              <Image
                src="/logo.png"
                alt="BillSmith Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-4">
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-9 w-9",
                    userButtonPopoverCard: "shadow-lg rounded-xl",
                  },
                }}
              />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex items-center rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-blue-600 hover:to-indigo-700 focus:outline-none active:scale-95 transition">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
}
