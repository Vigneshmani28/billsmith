"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // adjust path if needed
import {
  AlertCircle,
  CheckCircle,
  LogOut,
  MoveRight,
  User,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  console.log("Navbar user:", user);

  const displayName = user?.name || user?.username || "User";

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
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{displayName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-1">
                          {user?.username || user?.name}
                          {user?.isConfirmed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </span>
                        {user?.email && (
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    className="group flex items-center gap-2 !text-red-500 !hover:text-red-600 cursor-pointer"
                  >
                    Logout
                    <LogOut className="h-3 w-3 !text-red-500 group-hover:!text-red-600" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
