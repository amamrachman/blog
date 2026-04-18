import { useState, useEffect, type ReactNode } from "react";
import type { User } from "@/types";
import { getMe } from "@/api/client";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      refetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const refetchUser = async () => {
    try {
      setIsLoading(true);
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      console.error("Auth refetch error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, refetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
