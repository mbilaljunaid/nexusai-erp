import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { ArrowRight, LogIn } from "lucide-react";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { useRBAC } from "@/components/RBACContext";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useRBAC();

  useEffect(() => {
    document.title = "Login | NexusAI";
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleReplitLogin = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="public-page min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <Badge className="public-badge mb-4">LOGIN</Badge>
            <h1 className="public-hero-title text-4xl font-bold mb-2">Welcome Back</h1>
            <p className="public-hero-subtitle">Sign in to access your NexusAI dashboard</p>
          </div>

          <Card className="public-card p-8" data-testid="card-login">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-muted-foreground mb-4">
                  Sign in securely with your Replit account to access the NexusAI platform.
                </p>
              </div>

              <Button
                onClick={handleReplitLogin}
                className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white"
                data-testid="button-login-replit"
              >
                <LogIn className="mr-2 w-4 h-4" />
                Sign in with Replit
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Secure Authentication
                  </span>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground text-center">
                <p className="text-xs">
                  Your data is protected with enterprise-grade security. 
                  Authentication is handled securely through Replit.
                </p>
              </div>

              <p className="text-center text-muted-foreground text-sm">
                Don't have a Replit account?{" "}
                <a 
                  href="https://replit.com/signup" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:opacity-80 font-medium"
                >
                  Create one
                </a>
              </p>
            </div>
          </Card>

          <div className="text-center mt-8">
            <Link to="/" className="text-muted-foreground hover:text-foreground text-sm">
              ← Back to home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
