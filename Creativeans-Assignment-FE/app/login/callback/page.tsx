"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/store/authstore";
import { toast } from "sonner";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setToken = useAuth((state) => state.setToken);

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      toast.error(error || "Authentication failed");
      router.push("/login");
      return;
    }

    if (token) {
      // Store token in auth state and cookies
      setToken(token);
      toast.success("Sign in successful!");
      router.push("/");
    } else {
      toast.error("No token received");
      router.push("/login");
    }
  }, [searchParams, setToken, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Completing sign in...</h1>
        <p className="text-gray-500">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}
