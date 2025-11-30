import { createContext, useContext, ReactNode } from "react";

interface RBACContextType {
  tenantId: string;
  userId: string;
  userRole: "admin" | "editor" | "viewer";
  headers: Record<string, string>;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export function RBACProvider({ children }: { children: ReactNode }) {
  // Demo default context (in production, this would come from authentication system)
  const rbacContext: RBACContextType = {
    tenantId: "tenant1",
    userId: "user1",
    userRole: "admin",
    headers: {
      "x-tenant-id": "tenant1",
      "x-user-id": "user1",
      "x-user-role": "admin",
    },
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
