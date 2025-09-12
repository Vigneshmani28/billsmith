"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { confirmRegistration, resetConfirmState } from "@/store/slices/auth/confirmRegistrationSlice";
import { useAuth } from "@/context/auth-context";

export default function ConfirmRegistrationPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { token } = useParams();
  const safeToken = typeof token === "string" ? token : "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

   const dispatch = useDispatch<AppDispatch>();
  const { loading:confirmLoading, success, error } = useSelector(
    (state: RootState) => state.confirmRegistration
  );

   // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    dispatch(confirmRegistration({ token: safeToken, name, password, confirmPassword }));
  };

  // 🔑 Effect for success/failure handling
  useEffect(() => {
    if (success) {
      toast.success("Registration complete! You can now login.");
      router.push("/login");
      dispatch(resetConfirmState());
    }
    if (error) {
        toast.error("Failed to confirm registration");
      return;
    }
  }, [success, error, router, dispatch]);
  
  return (
    <div className="flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Complete Your Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col">
              <Label className="mb-2">Name</Label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col">
              <Label className="mb-2">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="flex flex-col">
               <Label className="mb-2">Confirm Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={confirmLoading}>
              {confirmLoading ? "Submitting..." : "Complete Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
