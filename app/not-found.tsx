'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, WifiOff } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function NotFound() {
 const { user} = useAuth();
  return (
    <div className="flex flex-col items-center justify-center text-center bg-background">
      <div className="mb-6 flex items-center justify-center">
        <WifiOff className="w-16 h-16 text-primary" />
      </div>
      <h1 className="text-5xl font-bold mb-4">Page Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <Button asChild>
        {user ? (
          <Link href="/">Go to Dashboard</Link>
        ) : (
          <Link href="/login">Go to login</Link>
        )}
      </Button>
    </div>
  );
}
