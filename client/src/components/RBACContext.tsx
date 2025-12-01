import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";

interface RBACContextType {
  tenantId: string;
  userId: string;
  userRole: "admin" | "editor" | "viewer";
  headers: Record<string, string>;
  isAuthenticated: boolean;
  login: (userId: string, userRole: "admin" | "editor" | "viewer") => void;
  logout: () => void;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export function RBACProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage with persistence
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("authToken");
    return stored ? true : false;
  });

  const [userId, setUserId] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("userId") || "";
  });

  const [userRole, setUserRole] = useState<"admin" | "editor" | "viewer">(() => {
    if (typeof window === "undefined") return "viewer";
    return (localStorage.getItem("userRole") as "admin" | "editor" | "viewer") || "viewer";
  });

  // Persist auth state changes to localStorage
  useEffect(() => {
    if (isAuthenticated && userId) {
      localStorage.setItem("authToken", "true");
      localStorage.setItem("userId", userId);
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("authTimestamp", Date.now().toString());
    }
  }, [isAuthenticated, userId, userRole]);

  // Verify session is still valid on app focus
  useEffect(() => {
    const handleFocus = () => {
      const authToken = localStorage.getItem("authToken");
      const storedUserId = localStorage.getItem("userId");
      if (!authToken || !storedUserId) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        setUserId(storedUserId);
        setUserRole((localStorage.getItem("userRole") as "admin" | "editor" | "viewer") || "viewer");
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const login = useCallback((id: string, role: "admin" | "editor" | "viewer") => {
    setUserId(id);
    setUserRole(role);
    setIsAuthenticated(true);
    localStorage.setItem("authToken", "true");
    localStorage.setItem("userId", id);
    localStorage.setItem("userRole", role);
    localStorage.setItem("authTimestamp", Date.now().toString());
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUserId("");
    setUserRole("viewer");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("authTimestamp");
  }, []);

  const rbacContext: RBACContextType = {
    tenantId: "tenant1",
    userId: userId || "guest",
    userRole,
    headers: {
      "x-tenant-id": "tenant1",
      "x-user-id": userId || "guest",
      "x-user-role": userRole,
    },
    isAuthenticated,
    login,
    logout,
  };

  return (
    <RBACContext.Provider value={rbacContext}>
      {children}
    </RBACContext.Provider>
  );
}

export function useRBAC() {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error("useRBAC must be used within RBACProvider");
  }
  return context;
}
