
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Link as LinkIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";

export default function SupplierPortalLogin() {
    const [, setLocation] = useLocation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [token, setToken] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await apiRequest("POST", "/api/portal/supplier/login", { token });
            const data = await res.json();

            localStorage.setItem("supplier_token", data.token);
            setLocation("/portal/supplier/dashboard");
        } catch (err: any) {
            setError(err.message || "Invalid portal token");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid items-center justify-center bg-slate-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <LinkIcon className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Supplier Portal</CardTitle>
                    <CardDescription className="text-center">
                        Enter your secure access token to view orders and manage payments
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="token">Access Token</Label>
                            <Input
                                id="token"
                                placeholder="skl_..."
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                autoComplete="off"
                                required
                            />
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Access Portal
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="text-xs text-center text-muted-foreground">
                    NexusAI ERP &copy; 2026
                </CardFooter>
            </Card>
        </div>
    );
}
