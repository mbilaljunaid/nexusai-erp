
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";

export default function ServiceRequestPortal() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        assetId: "",
        description: "",
        priority: "NORMAL"
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
            setFormData({ assetId: "", description: "", priority: "NORMAL" });
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/service-requests"] });
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.assetId || !formData.description) {
            toast({ title: "Validation Error", description: "Asset and Description are required.", variant: "destructive" });
            return;
        }
        mutation.mutate(formData);
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Service Request Portal</h1>
                    <p className="text-muted-foreground">Report asset failures or request maintenance.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Submission Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Report an Issue</CardTitle>
                        <CardDescription>Describe the problem to help us prioritize.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Asset</Label>
                                <Select
                                    value={formData.assetId}
                                    onValueChange={(val) => setFormData({ ...formData, assetId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Asset" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingAssets ? <div className="p-2">Loading...</div> :
                                            assets?.map((a: any) => (
                                                <SelectItem key={a.id} value={a.id}>
                                                    {a.assetNumber} - {a.description}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(val) => setFormData({ ...formData, priority: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low - Cosmetic/Minor</SelectItem>
                                        <SelectItem value="NORMAL">Normal - Standard Repair</SelectItem>
                                        <SelectItem value="HIGH">High - Urgent/Safety</SelectItem>
                                        <SelectItem value="CRITICAL">Critical - Line Down</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    placeholder="Describe the issue..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Request
                            </Button>
                        </form>
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
            </div>
        </div>
    );
}
