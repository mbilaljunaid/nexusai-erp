import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { useRBAC } from "@/components/RBACContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [, navigate] = useLocation();
  const { login, isAuthenticated, isLoading } = useRBAC();

  useEffect(() => {
    document.title = "Login | NexusAI";
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        await login(data.user.id, data.user.role || "viewer");
        setSuccess(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        const data = await res.json();
        setError(data.message || "Invalid credentials");
      }
    } catch (e) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: "admin@nexusai.com", password: "Admin@2025!" }),
      });

      if (res.ok) {
        const data = await res.json();
        await login(data.user.id, "admin");
        setSuccess(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        const data = await res.json();
        setError(data.message || "Login failed. Admin account may not exist yet.");
      }
    } catch (e) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
            {success ? (
              <div className="text-center py-8">
                <div className="mb-4 text-green-400 text-4xl">
                  <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Login Successful!</h2>
                <p className="text-muted-foreground mb-6">Redirecting to dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="p-4 bg-destructive/20 border border-destructive/50 rounded text-destructive text-sm" data-testid="alert-error">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@company.com"
                      className="w-full pl-10 pr-4 py-2 bg-input border border-input rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2 bg-input border border-input rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                      required
                      data-testid="input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-primary hover:opacity-80">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  data-testid="button-login"
                >
                  {loading ? "Signing in..." : "Sign In"} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>

                <Button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                  data-testid="button-quick-admin-login"
                >
                  Quick Login as Admin
                </Button>

                <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground text-center">
                  <p className="text-xs">Use the "Quick Login as Admin" button for demo access, or create an account first.</p>
                </div>

                <p className="text-center text-muted-foreground text-sm">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:opacity-80 font-medium">
                    Sign up
                  </Link>
                </p>
              </form>
            )}
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
