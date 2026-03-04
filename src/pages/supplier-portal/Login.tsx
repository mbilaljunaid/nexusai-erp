
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Link as LinkIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { StandardPage } from "@/components/layout/StandardPage";
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

const loginSchema = z.object({
    token: z.string().min(1, "Access token is required"),
});

export default function SupplierPortalLogin() {
    const [, setLocation] = useLocation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { token: "" },
    });

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        setLoading(true);
        setError("");

        try {
            const res = await apiRequest("POST", "/api/portal/supplier/login", { token: values.token });
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
        <StandardPage title="Page Title">
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
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="token"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Access Token</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="skl_..."
                                                autoComplete="off"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                    </Form>
                </CardContent>
                <CardFooter className="text-xs text-center text-muted-foreground">
                    NexusAI ERP &copy; 2026
                </CardFooter>
            </Card>
        </StandardPage>
    );
}
