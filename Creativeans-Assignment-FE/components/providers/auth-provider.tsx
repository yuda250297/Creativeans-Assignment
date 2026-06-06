"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/authstore";

/**
 * Provider component to initialize auth state on app startup
 * Restores JWT token from cookies on page load
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuth((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
