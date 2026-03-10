import { useEffect } from "react";
import { useRBAC } from "@/components/RBACContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

type UserRole = "admin" | "editor" | "viewer";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export function RoleProtectedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath = "/dashboard" 
}: RoleProtectedRouteProps) {
  const { toast } = useToast();
  const { isAuthenticated, userRole } = useRBAC();
  const [, navigate] = useLocation();

  const hasAccess = allowedRoles.includes(userRole);

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      navigate("/login");
    } else if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, hasAccess, toast, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="redirect-login">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting to login...</span>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="access-denied">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <ShieldAlert className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You don't have the required permissions to access this page. 
              Contact your administrator if you believe this is an error.
            </p>
            <div className="flex flex-col gap-2">
              <Link to={fallbackPath}>
                <Button className="w-full" data-testid="button-go-back">
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/help">
                <Button variant="outline" className="w-full" data-testid="button-get-help">
                  Get Help
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute allowedRoles={["admin"]}>
      {children}
    </RoleProtectedRoute>
  );
}

export function EditorOrAdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute allowedRoles={["admin", "editor"]}>
      {children}
    </RoleProtectedRoute>
  );
}
