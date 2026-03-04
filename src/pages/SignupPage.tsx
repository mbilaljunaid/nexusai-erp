import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, User, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header, Footer } from "@/components/Navigation";
import { GlassmorphismCard } from "@/components/lovable";
import { colors } from "@/lib/design-tokens";
import { animations } from "@/lib/animations";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Sign Up | NexusAI";
  }, []);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.name, email: values.email, password: values.password }),
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
    <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Animated Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(circle at 60% 40%, ${colors.brand.blue}20 0%, transparent 100%)`,
          opacity: 0.5
        }}
      />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <motion.div
          className="absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Side: Features/Benefits */}
          <motion.div
            className="hidden lg:block space-y-8"
            {...animations.slideInRight}
          >
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Join the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Open Source Revolution
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Get full access to the source code, community support, and enterprise features.
                Free forever for developers.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                { title: "Unlimited Users", desc: "No per-seat pricing" },
                { title: "85+ Modules", desc: "Finance, HR, CRM included" },
                { title: "Self-Hosted", desc: "Your data, your control" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Signup Form */}
          <motion.div
            className="w-full max-w-md mx-auto lg:order-first"
            {...animations.fadeInUp}
          >
            <GlassmorphismCard className="p-8 backdrop-blur-xl border-white/10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Create Account</h2>
                <p className="text-muted-foreground">Start your journey with NexusAI</p>
              </div>

              {success ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">Account Created!</h3>
                  <p className="text-muted-foreground">Redirecting to login...</p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center"
                      >
                        {error}
                      </motion.div>
                    )}

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="ml-1">Full Name</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                              <Input
                                placeholder="John Doe"
                                className="pl-10 h-11 bg-white/5 border-white/10 focus:border-blue-500/50 transition-all"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="ml-1">Email</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                              <Input
                                type="email"
                                placeholder="your@company.com"
                                className="pl-10 h-11 bg-white/5 border-white/10 focus:border-blue-500/50 transition-all"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ml-1">Password</FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  className="pl-10 h-11 bg-white/5 border-white/10 focus:border-blue-500/50 transition-all"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ml-1">Confirm</FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  className="pl-4 h-11 bg-white/5 border-white/10 focus:border-blue-500/50 transition-all"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-3 text-muted-foreground hover:text-white transition-colors"
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="terms"
                      render={({ field }) => (
                        <FormItem className="flex items-start gap-2 pt-2 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              className="mt-1 rounded bg-white/10 border-white/20"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <div className="leading-none">
                            <FormLabel className="text-sm text-muted-foreground font-normal cursor-pointer">
                              I agree to the <a href="#" className="text-blue-400 hover:text-blue-300">Terms</a> and <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-900/20"
                      disabled={loading}
                      size="lg"
                    >
                      {loading ? "Creating..." : "Create Account"}
                      {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                    </Button>
                  </form>
                </Form>
              )}

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login">
                    <span className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
                      Sign in
                    </span>
                  </Link>
                </p>
              </div>
            </GlassmorphismCard>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
