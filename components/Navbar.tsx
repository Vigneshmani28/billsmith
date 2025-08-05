"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <Link 
        href="/" 
        className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent"
      >
        InvoiceApp
      </Link>

      <div className="flex items-center gap-6">
        {/* Show this only when signed in */}
        <SignedIn>
          <div className="flex items-center gap-4">
            <div className="h-8 w-px bg-gray-200"></div>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-9 w-9",
                  userButtonPopoverCard: "shadow-lg rounded-xl",
                }
              }}
            />
          </div>
        </SignedIn>

        {/* Show Sign in button when signed out */}
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-md transition-all hover:from-blue-600 hover:to-indigo-700 active:scale-95">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}