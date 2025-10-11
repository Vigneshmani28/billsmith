"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertCircle, CheckCircle, LogOut, Settings, User } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  const displayName = user?.name || user?.username || "User";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="block">
            <span className="text-xl sm:text-2xl font-semibold tracking-tight bg-gradient-to-r from-gray-900 to-gray-500 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              BillSmith
            </span>
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
                <DropdownMenuContent align="end" className="w-56">
                  {/* User Info */}
                  <DropdownMenuItem className="cursor-default select-none pointer-events-none">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
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
                  {/* Divider */}
                  <div className="my-1">
                    <div className="h-px bg-muted" />
                  </div>
                  {/* Settings */}
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  {/* Divider */}
                  <div className="my-1">
                    <div className="h-px bg-muted" />
                  </div>
                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={logout}
                    className="group flex items-center gap-2 !text-red-500 !hover:text-red-600 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 !text-red-500 group-hover:!text-red-600" />
                    <span>Logout</span>
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
