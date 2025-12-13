import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";

export type EnterpriseRole = 
  | "implementation_partner" 
  | "business_user" 
  | "end_user" 
  | "business_analyst" 
  | "tenant_admin" 
  | "platform_admin" 
  | "super_admin";

export const ENTERPRISE_ROLES: { value: EnterpriseRole; label: string }[] = [
  { value: "implementation_partner", label: "Implementation Partner" },
  { value: "business_user", label: "Business User" },
  { value: "end_user", label: "End User / Operational User" },
  { value: "business_analyst", label: "Business Analyst" },
  { value: "tenant_admin", label: "Tenant Admin" },
  { value: "platform_admin", label: "Platform Admin" },
  { value: "super_admin", label: "Super Admin" },
];

interface RBACContextType {
  tenantId: string;
  userId: string;
  userRole: "admin" | "editor" | "viewer";
  enterpriseRole: EnterpriseRole;
  headers: Record<string, string>;
  isAuthenticated: boolean;
  login: (userId: string, userRole: "admin" | "editor" | "viewer", enterpriseRole?: EnterpriseRole) => void;
  logout: () => void;
  setEnterpriseRole: (role: EnterpriseRole) => void;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export function RBACProvider({ children }: { children: ReactNode }) {
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

  const [enterpriseRole, setEnterpriseRoleState] = useState<EnterpriseRole>(() => {
    if (typeof window === "undefined") return "end_user";
    return (localStorage.getItem("enterpriseRole") as EnterpriseRole) || "end_user";
  });

  useEffect(() => {
    if (isAuthenticated && userId) {
      localStorage.setItem("authToken", "true");
      localStorage.setItem("userId", userId);
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("enterpriseRole", enterpriseRole);
      localStorage.setItem("authTimestamp", Date.now().toString());
    }
  }, [isAuthenticated, userId, userRole, enterpriseRole]);

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
        setEnterpriseRoleState((localStorage.getItem("enterpriseRole") as EnterpriseRole) || "end_user");
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const login = useCallback((id: string, role: "admin" | "editor" | "viewer", entRole?: EnterpriseRole) => {
    setUserId(id);
    setUserRole(role);
    if (entRole) {
      setEnterpriseRoleState(entRole);
    }
    setIsAuthenticated(true);
    localStorage.setItem("authToken", "true");
    localStorage.setItem("userId", id);
    localStorage.setItem("userRole", role);
    if (entRole) {
      localStorage.setItem("enterpriseRole", entRole);
    }
    localStorage.setItem("authTimestamp", Date.now().toString());
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUserId("");
    setUserRole("viewer");
    setEnterpriseRoleState("end_user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("enterpriseRole");
    localStorage.removeItem("authTimestamp");
  }, []);

  const setEnterpriseRole = useCallback((role: EnterpriseRole) => {
    setEnterpriseRoleState(role);
    localStorage.setItem("enterpriseRole", role);
  }, []);

  const rbacContext: RBACContextType = {
    tenantId: "tenant1",
    userId: userId || "guest",
    userRole,
    enterpriseRole,
    headers: {
      "x-tenant-id": "tenant1",
      "x-user-id": userId || "guest",
      "x-user-role": userRole,
      "x-enterprise-role": enterpriseRole,
    },
    isAuthenticated,
    login,
    logout,
    setEnterpriseRole,
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
