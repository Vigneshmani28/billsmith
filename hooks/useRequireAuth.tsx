import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRequireAuth() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !token)) {
      router.replace("/login");
    }
  }, [user, token, loading, router]);

  // Return loading state so the page can decide what to render
  return { user, token, loading };
}