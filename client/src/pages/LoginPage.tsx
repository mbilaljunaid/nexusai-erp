import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Login | NexusAI";
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
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
                <div className="mb-4 text-green-400 text-4xl">✓</div>
                <h2 className="text-2xl font-bold text-white mb-2">Login Successful!</h2>
                <p className="text-slate-300 mb-6">Redirecting to dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-600/20 border border-red-600/50 rounded text-red-300 text-sm" data-testid="alert-error">
                    {error}
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5" style={{ color: `hsl(var(--muted-foreground))` }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@company.com"
                      className="w-full pl-10 pr-4 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--input-border))] rounded text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))]"
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5" style={{ color: `hsl(var(--muted-foreground))` }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--input-border))] rounded text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))]"
                      required
                      data-testid="input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3"
                      style={{ color: `hsl(var(--muted-foreground))` }}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span>Remember me</span>
                  </label>
                  <Link href="/forgot-password">
                    <a style={{ color: `hsl(var(--primary))` }} className="hover:opacity-80">Forgot password?</a>
                  </Link>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white"
                  data-testid="button-login"
                >
                  {loading ? "Signing in..." : "Sign In"} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>

                {/* Credentials */}
                <div className="space-y-3">
                  <div className="p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-sm text-red-300">
                    <p className="font-semibold mb-2">Super Admin:</p>
                    <p className="text-xs">Email: admin@nexusai.com</p>
                    <p className="text-xs">Password: Admin@2025!</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg text-sm text-slate-300">
                    <p className="font-semibold mb-2">Demo User:</p>
                    <p className="text-xs">Email: demo@nexusai.com</p>
                    <p className="text-xs">Password: Demo@2025</p>
                  </div>
                </div>

                {/* Sign Up Link */}
                <p className="text-center text-slate-400 text-sm">
                  Don't have an account?{" "}
                  <Link href="/signup">
                    <a className="text-blue-400 hover:text-blue-300 font-medium">Sign up</a>
                  </Link>
                </p>
              </form>
            )}
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link href="/">
              <a className="text-slate-400 hover:text-slate-300 text-sm">← Back to home</a>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
