
import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";

const formSchema = z.object({
    assetId: z.string().min(1, "Asset selection is required"),
    priority: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL"]),
    description: z.string().min(1, "Description is required"),
});

export default function ServiceRequestPortal() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            assetId: "",
            description: "",
            priority: "NORMAL"
        }
    });

    // Fetch Assets
    const { data: assets, isLoading: loadingAssets } = useQuery({
        queryKey: ["/api/maintenance/assets"],
        queryFn: () => fetch("/api/maintenance/assets").then(r => r.json())
    });

    // Fetch My Requests (Optional, just list all for now or filter by user if auth exists)
    // For demo, we list all recent "NEW" requests to show immediate feedback
    const { data: myRequests } = useQuery({
        queryKey: ["/api/maintenance/service-requests"],
        queryFn: () => fetch("/api/maintenance/service-requests").then(r => r.json())
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/maintenance/service-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Request Submitted", description: "Maintenance team has been notified." });
            form.reset();
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/service-requests"] });
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        mutation.mutate(values);
    };

    return (
        <StandardPage
            title="Service Request Portal"
            description="Report asset failures or request maintenance."
        >
            <div className="grid gap-6 md:grid-cols-2">
                {/* Submission Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Report an Issue</CardTitle>
                        <CardDescription>Describe the problem to help us prioritize.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="assetId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Asset</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Asset" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {loadingAssets ? <div className="p-2">Loading...</div> :
                                                        assets?.map((a: any) => (
                                                            <SelectItem key={a.id} value={String(a.id)}>
                                                                {a.assetNumber} - {a.description}
                                                            </SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Priority</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="LOW">Low - Cosmetic/Minor</SelectItem>
                                                    <SelectItem value="NORMAL">Normal - Standard Repair</SelectItem>
                                                    <SelectItem value="HIGH">High - Urgent/Safety</SelectItem>
                                                    <SelectItem value="CRITICAL">Critical - Line Down</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe the issue..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Request
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Recent Requests List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {myRequests?.length === 0 && <div className="text-center text-muted-foreground py-8">No active requests</div>}
                            {myRequests?.slice(0, 5).map((sr: any) => (
                                <div key={sr.id} className="border rounded-lg p-3 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <span className="font-medium text-sm">{sr.requestNumber}</span>
                                        <div className={`text-xs px-2 py-1 rounded-full ${sr.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                                            sr.status === 'CONVERTED' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                                            }`}>
                                            {sr.status}
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium">{sr.asset?.assetNumber}</div>
                                    <div className="text-sm text-muted-foreground line-clamp-2">{sr.description}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </StandardPage>
    );
}
