import { useEffect } from "react";
import { useRBAC } from "@/components/RBACContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useRBAC();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, toast, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="loading-auth">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="redirect-login">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting to login...</span>
      </div>
    );
  }

  return <>{children}</>;
}
