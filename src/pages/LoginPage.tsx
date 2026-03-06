import { useState, useEffect} from"react";
import { PageSkeleton} from"@/components/shared/PageSkeleton";
import { Link, useLocation} from"wouter";
import { motion} from"framer-motion";
import { ArrowRight, Mail, Lock, Eye, EyeOff, CheckCircle, Star} from"lucide-react";
import { Button} from"@/components/ui/button";
import { Input} from"@/components/ui/input";
import { Header, Footer} from"@/components/Navigation";
import { GlassmorphismCard} from"@/components/lovable"; // Premium card
import { useRBAC} from"@/components/RBACContext";
import { colors} from"@/lib/design-tokens";
import { animations} from"@/lib/animations";
import { z} from"zod";
import { useForm} from"react-hook-form";
import { zodResolver} from"@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from"@/components/ui/form";
import { Checkbox} from"@/components/ui/checkbox";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1,"Password is required"),
  rememberMe: z.boolean().optional(),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [, navigate] = useLocation();
  const { login, isAuthenticated, isLoading} = useRBAC();

  useEffect(() => {
    document.title ="Login | NexusAI - Premium ERP";
 }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
   }
 }, [isLoading, isAuthenticated, navigate]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email:"",
      password:"",
      rememberMe: false,
   },
 });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        credentials:"include",
        body: JSON.stringify({ email: values.email, password: values.password}),
     });

      if (res.ok) {
        const data = await res.json();
        await login(data.user.id, data.user.role ||"viewer");
        setSuccess(true);
        setTimeout(() => {
          navigate("/dashboard");
       }, 1000);
     } else {
        const data = await res.json();
        setError(data.message ||"Invalid credentials");
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
      await login("demo-admin-user","admin");
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
     }, 1000);
   } catch (e) {
      setError("Login failed. Please try again.");
   } finally {
      setLoading(false);
   }
 };

  if (isLoading) return <PageSkeleton showCards={false} rows={4} />;

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Animated Background */}
      <style>{`.lp-bg-gradient { background: radial-gradient(circle at 50% 50%, ${colors.brand.purple}20 0%, transparent 100%); opacity: 0.5;}`}</style>
      <div className="absolute inset-0 lp-bg-gradient" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <motion.div
          className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px]"
          animate={{ x: [0, -50, 0], y: [0, 50, 0]}}
          transition={{ duration: 20, repeat: Infinity, ease:"linear"}}
        />
        <motion.div
          className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, -50, 0]}}
          transition={{ duration: 25, repeat: Infinity, ease:"linear"}}
        />
      </div>

      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Side: Branding / Testimonial */}
          <motion.div
            className="hidden lg:block space-y-8"
            {...animations.slideInLeft}
          >
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Welcome to the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                  Future of ERP
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Experience the power of open-source enterprise management.
                Secure, scalable, and built for modern teams.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-lg italic mb-4">"NexusAI has completely transformed our workflow. The interface is stunning and intuitive."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center font-bold text-white">
                  SC
                </div>
                <div>
                  <div className="font-semibold">Sarah Chen</div>
                  <div className="text-sm text-muted-foreground">CTO, Global Logistics</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Login Form */}
          <motion.div
            className="w-full max-w-md mx-auto"
            {...animations.fadeInUp}
            transition={{ delay: 0.2}}
          >
            <GlassmorphismCard className="p-8 backdrop-blur-xl border-white/10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Sign In</h2>
                <p className="text-muted-foreground">Access your dashboard</p>
              </div>

              {success ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0}}
                    animate={{ scale: 1}}
                    className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">Welcome Back!</h3>
                  <p className="text-muted-foreground">Redirecting...</p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10}}
                        animate={{ opacity: 1, y: 0}}
                        className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field}) => (
                          <FormItem>
                            <FormLabel className="ml-1">Email</FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                  type="email"
                                  placeholder="name@company.com"
                                  className="pl-10 h-11 bg-white/5 border-white/10 focus:border-primary/50 transition-all"
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
                        name="password"
                        render={({ field}) => (
                          <FormItem>
                            <FormLabel className="ml-1">Password</FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                  type={showPassword ?"text" :"password"}
                                  placeholder="••••••••"
                                  className="pl-10 h-11 bg-white/5 border-white/10 focus:border-primary/50 transition-all"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-3 text-muted-foreground hover:text-white transition-colors"
                                >
                                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <FormField
                        control={form.control}
                        name="rememberMe"
                        render={({ field}) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                id="rememberMe"
                                className="rounded bg-white/10 border-white/20"
                                aria-label="Remember me"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel htmlFor="rememberMe" className="cursor-pointer text-muted-foreground hover:text-white transition-colors font-normal">
                              Remember me
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <Link to="/forgot-password">
                        <span className="text-primary hover:text-primary/80 cursor-pointer">Forgot password?</span>
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                      disabled={loading}
                      size="lg"
                    >
                      {loading ?"Signing in..." :"Sign In"}
                      {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                    </Button>
                  </form>
                </Form>
              )}

              <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-4">
                <Button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  variant="outline"
                  className="w-full border-white/10 hover:bg-white/5"
                >
                  Quick Admin Demo
                </Button>

                <p className="text-sm text-muted-foreground">
                  Don't have an account?{""}
                  <Link to="/signup">
                    <span className="text-primary hover:text-primary/80 font-medium cursor-pointer">
                      Create free account
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
