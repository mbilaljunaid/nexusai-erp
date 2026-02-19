import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, Eye, EyeOff, CheckCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header, Footer } from "@/components/Navigation";
import { GlassmorphismCard } from "@/components/lovable";
import { colors } from "@/lib/design-tokens";
import { animations } from "@/lib/animations";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "reset" | "success">("email");
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Reset Password | NexusAI";
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetCode, newPassword }),
      });

      if (res.ok) {
        setStep("success");
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
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
    <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Animated Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(circle at 30% 70%, ${colors.primary[950]} 0%, ${colors.background} 100%)`,
          opacity: 0.6
        }}
      />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <motion.div
          className="absolute top-[20%] right-[30%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <motion.div
          className="w-full max-w-md mx-auto"
          {...animations.fadeInUp}
        >
          <GlassmorphismCard className="p-8 backdrop-blur-xl border-white/10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                <KeyRound className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Password Reset</h2>
              <p className="text-muted-foreground">
                {step === "email" && "Enter your email to receive a code"}
                {step === "reset" && "Secure your account with a new password"}
                {step === "success" && "You're all set!"}
              </p>
            </div>

            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="pl-10 h-11 bg-white/5 border-white/10 focus:border-indigo-500/50 transition-all"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-base font-semibold shadow-lg shadow-indigo-900/20"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? "Sending..." : "Send Reset Code"}
                  {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={handleResetSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-1">Reset Code</label>
                  <Input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="h-11 bg-white/5 border-white/10 focus:border-indigo-500/50 transition-all text-center tracking-widest text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-1">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="pl-10 h-11 bg-white/5 border-white/10 focus:border-indigo-500/50 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-1">Confirm Password</label>
                  <div className="relative group">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="pl-4 h-11 bg-white/5 border-white/10 focus:border-indigo-500/50 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-base font-semibold shadow-lg shadow-indigo-900/20"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? "Resetting..." : "Set New Password"}
                  {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </form>
            )}

            {step === "success" && (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Password Reset!</h3>
                <p className="text-muted-foreground mb-6">Your account is secure. Redirecting to login...</p>
                <Link to="/login">
                  <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
                    Proceed to Login
                  </Button>
                </Link>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <Link to="/login">
                <span className="text-sm text-muted-foreground hover:text-white cursor-pointer flex items-center justify-center gap-2">
                  <ArrowRight className="w-4 h-4 rotate-180" /> Back to Login
                </span>
              </Link>
            </div>
          </GlassmorphismCard>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
