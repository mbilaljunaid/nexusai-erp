import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Mail, Lock, User, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Sign Up | NexusAI";
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.message || "Signup failed");
      }
    } catch (e) {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-600/20 text-blue-300 border-blue-500/50">SIGN UP</Badge>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-slate-300">Join NexusAI and transform your business</p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700 p-8" data-testid="card-signup">
            {success ? (
              <div className="text-center py-8">
                <div className="mb-4 text-green-400 text-4xl">✓</div>
                <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
                <p className="text-slate-300 mb-6">Redirecting to login...</p>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-5">
                {error && (
                  <div className="p-4 bg-red-600/20 border border-red-600/50 rounded text-red-300 text-sm" data-testid="alert-error">
                    {error}
                  </div>
                )}

                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      required
                      data-testid="input-name"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@company.com"
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      required
                      data-testid="input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">At least 8 characters</p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      required
                      data-testid="input-confirm-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                      data-testid="button-toggle-confirm-password"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded mt-1" required />
                  <span className="text-sm text-slate-300">
                    I agree to the{" "}
                    <a href="#" className="text-blue-400 hover:text-blue-300">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-400 hover:text-blue-300">
                      Privacy Policy
                    </a>
                  </span>
                </label>

                {/* Sign Up Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="button-signup"
                >
                  {loading ? "Creating Account..." : "Create Account"} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>

                {/* Login Link */}
                <p className="text-center text-slate-400 text-sm">
                  Already have an account?{" "}
                  <Link href="/login">
                    <a className="text-blue-400 hover:text-blue-300 font-medium">Sign in</a>
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
