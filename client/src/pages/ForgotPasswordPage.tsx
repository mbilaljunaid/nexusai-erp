import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "reset" | "success">("email");
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Forgot Password | NexusAI";
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST"
        headers: { "Content-Type": "application/json" }
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setStep("reset");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to send reset email");
      }
    } catch (e) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST"
        headers: { "Content-Type": "application/json" }
        body: JSON.stringify({ email, resetCode, newPassword })
      });

      if (res.ok) {
        setStep("success");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to reset password");
      }
    } catch (e) {
      setError("Failed to reset password. Please try again.");
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
            <Badge className="mb-4 bg-blue-600/20 text-blue-300 border-blue-500/50">RESET PASSWORD</Badge>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Forgot Password?
            </h1>
            <p className="text-slate-300">
              {step === "email" && "Enter your email to receive a reset link"}
              {step === "reset" && "Enter the code and your new password"}
              {step === "success" && "Password reset successful"}
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700 p-8" data-testid="card-forgot-password">
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-600/20 border border-red-600/50 rounded text-red-300 text-sm" data-testid="alert-error">
                    {error}
                  </div>
                )}

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
                  <p className="text-xs text-slate-400 mt-2">We'll send a reset code to this email</p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="button-send-reset"
                >
                  {loading ? "Sending..." : "Send Reset Code"} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={handleResetSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 bg-red-600/20 border border-red-600/50 rounded text-red-300 text-sm" data-testid="alert-error">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Reset Code</label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    required
                    data-testid="input-reset-code"
                  />
                  <p className="text-xs text-slate-400 mt-1">Check your email for the code</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      required
                      data-testid="input-new-password"
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
                </div>

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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="button-reset-password"
                >
                  {loading ? "Resetting..." : "Reset Password"} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
            )}

            {step === "success" && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
                <p className="text-slate-300 mb-6">Your password has been reset successfully. Redirecting to login...</p>
              </div>
            )}
          </Card>

          {/* Back to Login */}
          <div className="text-center mt-8">
            <Link to="/login">
              <a className="text-slate-400 hover:text-slate-300 text-sm">← Back to login</a>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
