"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ContentLoader } from "@/components/loader";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");

  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEmail = (input: string) => {
    // simple regex for email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: { email?: string; username?: string; password: string } = {
      password,
    };

    if (isEmail(identifier)) {
      payload.email = identifier;
    } else {
      payload.username = identifier;
    }

    try {
      await login(payload);
      router.push("/");
    } catch (err: any) {
      toast.error("Login Failed", {
        description: err.message || "Invalid email/username or password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/70 z-50">
        <ContentLoader message="Loading invoices..." />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to access your dashboard
          </p>
        </CardHeader>

        <CardContent className="mt-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-col">
              <Label
                htmlFor="identifier"
                className="text-gray-700 dark:text-gray-300"
              >
                Email or Username
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="you@example.com or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div className="flex flex-col">
              <Label
                htmlFor="password"
                className="text-gray-700 dark:text-gray-300"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2 text-white inline-block" />
              ) : null}
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>

            <Separator />

            <div className="text-sm text-center">
              <Link
                href="/forgot-password"
                className="text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
