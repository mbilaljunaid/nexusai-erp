import { createContext, useContext, ReactNode, useState, useEffect } from "react";

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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem("userId") || "";
  });
  const [userRole, setUserRole] = useState<"admin" | "editor" | "viewer">(() => {
    return (localStorage.getItem("userRole") as "admin" | "editor" | "viewer") || "viewer";
  });

  const login = (id: string, role: "admin" | "editor" | "viewer") => {
    setUserId(id);
    setUserRole(role);
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userId", id);
    localStorage.setItem("userRole", role);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserId("");
    setUserRole("viewer");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
  };

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
