
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ServiceRequestQueue() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: requests, isLoading } = useQuery({
        queryKey: ["/api/maintenance/service-requests"],
        queryFn: () => fetch("/api/maintenance/service-requests").then(r => r.json())
    });

    const convertMutation = useMutation({
        mutationFn: async (srId: string) => {
            // Simple conversion taking defaults. In a real app, this would open a dialog to select Work Definition etc.
            const res = await fetch(`/api/maintenance/service-requests/${srId}/convert`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priority: "HIGH" }) // Defaulting to high for triage
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Work Order Created", description: "Service Request converted successfully." });
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/service-requests"] });
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Service Request Triage</h1>
                    <p className="text-muted-foreground">Review and convert incoming breakdown requests.</p>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Request #</TableHead>
                                <TableHead>Asset</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No requests found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {requests?.map((sr: any) => (
                                <TableRow key={sr.id}>
                                    <TableCell className="font-medium">{sr.requestNumber}</TableCell>
                                    <TableCell>{sr.asset?.assetNumber} <div className="text-xs text-muted-foreground">{sr.asset?.description}</div></TableCell>
                                    <TableCell>
                                        <Badge variant={sr.priority === 'CRITICAL' ? 'destructive' : 'secondary'}>{sr.priority}</Badge>
                                    </TableCell>
                                    <TableCell className="max-w-md truncate" title={sr.description}>{sr.description}</TableCell>
                                    <TableCell>
                                        <Badge variant={sr.status === 'NEW' ? 'default' : 'outline'}>{sr.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {sr.status === 'NEW' || sr.status === 'in_review' ? (
                                            <Button size="sm" onClick={() => convertMutation.mutate(sr.id)} disabled={convertMutation.isPending}>
                                                {convertMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                                    <>Convert to WO <ArrowRight className="ml-2 h-4 w-4" /></>}
                                            </Button>
                                        ) : (
                                            sr.status === 'CONVERTED' && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={`/maintenance/work-orders/${sr.workOrderId}`}>
                                                        View WO <ArrowRight className="ml-2 h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
