
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function PortalLogin() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await apiRequest("POST", "/api/portal/login", { email });
            const data = await res.json();

            localStorage.setItem("portal_token", data.token);
            localStorage.setItem("portal_customer", JSON.stringify(data.customer));

            toast({ title: "Welcome back!", description: "Logged in successfully." });
            setLocation("/portal/dashboard");
        } catch (err: any) {
            toast({
                title: "Login Failed",
                description: err.message || "Invalid credentials",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="flex items-center gap-2 mb-8">
                <div className="h-10 w-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">N</span>
                </div>
                <span className="font-bold text-2xl tracking-tight text-slate-800">Nexus<span className="text-emerald-600">Portal</span></span>
            </div>

            <Card className="w-full max-w-md shadow-lg border-emerald-100/50">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
                    <CardDescription className="text-center">
                        Access your invoices and payments securely
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Sign In
                        </Button>
                        <div className="text-center text-xs text-muted-foreground mt-4">
                            For demo purposes, use a valid customer email (e.g. finance@globex.com)
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
