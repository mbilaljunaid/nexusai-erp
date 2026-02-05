import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Building2, Mail, Landmark, Clock, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function SupplierOnboardingWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    const { data: requests, isLoading } = useQuery({
        queryKey: ["/api/supplier-portal/onboarding/pending"],
    });

    const approveMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/supplier-portal/onboarding/${id}/approve`, { method: "POST" });
            if (!res.ok) throw new Error("Approval failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/supplier-portal/onboarding/pending"] });
            toast({ title: "Supplier Approved", description: "Converted to Master Supplier record." });
            setSelectedRequest(null);
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
            const res = await fetch(`/api/supplier-portal/onboarding/${id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes })
            });
            if (!res.ok) throw new Error("Rejection failed");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/supplier-portal/onboarding/pending"] });
            toast({ title: "Registration Rejected" });
            setSelectedRequest(null);
        }
    });

    if (isLoading) return <div className="p-8">Loading requests...</div>;

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                    <CardTitle>Supplier Onboarding Workbench</CardTitle>
                    <CardDescription>Review and approve prospective supplier registrations.</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="rounded-xl border bg-card overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                            No pending registration requests.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    requests?.map((req: any) => (
                                        <TableRow key={req.id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                                                        <Building2 className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p>{req.companyName}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{req.taxId}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs space-y-1">
                                                    <p className="flex items-center gap-1.5 font-medium"><Mail className="w-3 h-3" /> {req.contactEmail}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(req.submittedAt).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                                    {req.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(req)}>
                                                    Review Request
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Supplier Registration Review</DialogTitle>
                        <DialogDescription>Verify compliance documents and financial data for {selectedRequest?.companyName}.</DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="pr-4 mt-4 h-full max-h-[60vh]">
                        <div className="grid gap-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                        <Building2 className="w-3 h-3" /> Business Information
                                    </h4>
                                    <div className="grid gap-2 text-sm bg-muted/30 p-4 rounded-lg">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Legal Name:</span>
                                            <span className="font-medium">{selectedRequest?.companyName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tax ID:</span>
                                            <span className="font-medium">{selectedRequest?.taxId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Classification:</span>
                                            <span className="font-medium">{selectedRequest?.businessClassification || 'Standard'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                        <Landmark className="w-3 h-3" /> Bank Account Details
                                    </h4>
                                    <div className="grid gap-2 text-sm bg-primary/5 p-4 rounded-lg border border-primary/10">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Name:</span>
                                            <span className="font-medium">{selectedRequest?.bankAccountName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Acct / IBAN:</span>
                                            <span className="font-medium">{selectedRequest?.bankAccountNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Routing:</span>
                                            <span className="font-medium">{selectedRequest?.bankRoutingNumber}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <FileText className="w-3 h-3" /> Attachments & Notes
                                </h4>
                                <div className="p-4 bg-muted/20 rounded-lg text-sm text-muted-foreground italic">
                                    {selectedRequest?.notes || "No additional notes provided by the applicant."}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="gap-2 sm:gap-0 mt-6 pt-6 border-t">
                        <Button
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => rejectMutation.mutate({ id: selectedRequest.id, notes: "Rejected by Procurement" })}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                            <X className="w-4 h-4 mr-2" /> Reject Registration
                        </Button>
                        <div className="flex-1" />
                        <Button
                            onClick={() => approveMutation.mutate(selectedRequest.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                            <Check className="w-4 h-4 mr-2" /> Approve & Create Supplier
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
