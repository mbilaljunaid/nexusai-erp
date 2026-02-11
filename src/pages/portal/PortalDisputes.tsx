import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { AlertCircle, CheckCircle, Clock, XCircle, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PortalDisputes() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [formData, setFormData] = useState({
        invoiceId: "",
        disputeReason: "",
        disputedAmount: "",
        description: ""
    });

    const { data: invoices } = useQuery({
        queryKey: ["/api/portal/invoices"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/portal/invoices");
            return res.json();
        }
    });

    // Fetch existing disputes
    const { data: disputes = [] } = useQuery({
        queryKey: ["/api/portal/disputes"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/portal/disputes");
            return res.json();
        }
    });

    const createDisputeMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const res = await fetch("/api/portal/disputes", {
                method: "POST",
                headers: { "x-portal-token": localStorage.getItem("portalToken") || "" },
                body: data, // FormData automatically sets Content-Type
            });
            if (!res.ok) throw new Error("Failed to create dispute");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/portal/disputes"] });
            toast({ title: "Dispute Created", description: "We will review your dispute and respond shortly." });
            setShowForm(false);
            setFormData({ invoiceId: "", disputeReason: "", disputedAmount: "", description: "" });
            setFiles([]);
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append("invoiceId", formData.invoiceId);
        formDataToSend.append("disputeReason", formData.disputeReason);
        if (formData.disputedAmount) formDataToSend.append("disputedAmount", formData.disputedAmount);
        formDataToSend.append("description", formData.description);
        files.forEach((file) => formDataToSend.append("attachments", file));
        createDisputeMutation.mutate(formDataToSend);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length + files.length > 5) {
            toast({ title: "Too many files", description: "Maximum 5 files allowed", variant: "destructive" });
            return;
        }
        setFiles([...files, ...selectedFiles]);
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    // Mock disputes for display (in real app, would fetch from backend)
    const mockDisputes = [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dispute Management</h1>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Report an Issue
                    </Button>
                )}
            </div>

            {/* Create Dispute Form */}
            {showForm && (
                <Card className="border-amber-200">
                    <CardHeader className="bg-amber-50">
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            Create New Dispute
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="invoiceId">Select Invoice *</Label>
                                <select
                                    id="invoiceId"
                                    aria-label="Select invoice to dispute"
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.invoiceId}
                                    onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                                    required
                                >
                                    <option value="">Choose an invoice...</option>
                                    {invoices?.filter((inv: any) => inv.status !== "Paid").map((inv: any) => (
                                        <option key={inv.id} value={inv.id}>
                                            {inv.invoiceNumber} - ${Number(inv.totalAmount).toLocaleString()} ({inv.status})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="disputeReason">Dispute Reason *</Label>
                                <Input
                                    id="disputeReason"
                                    placeholder="e.g., Incorrect amount, service not received..."
                                    value={formData.disputeReason}
                                    onChange={(e) => setFormData({ ...formData, disputeReason: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="disputedAmount">Disputed Amount (optional)</Label>
                                <Input
                                    id="disputedAmount"
                                    type="number"
                                    step="0.01"
                                    placeholder="Leave blank to dispute full amount"
                                    value={formData.disputedAmount}
                                    onChange={(e) => setFormData({ ...formData, disputedAmount: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Please provide details about your dispute..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="attachments">Attachments (max 5 files, 5MB each)</Label>
                                <Input
                                    id="attachments"
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="mt-1"
                                />
                                {files.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                                                <span className="truncate">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={createDisputeMutation.isPending}>
                                    {createDisputeMutation.isPending ? "Submitting..." : "Submit Dispute"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Disputes List */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Disputes</CardTitle>
                </CardHeader>
                <CardContent>
                    {disputes.length > 0 ? (
                        <div className="space-y-3">
                            {disputes.map((dispute: any) => (
                                <div key={dispute.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{dispute.disputeReason}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Invoice: {dispute.invoiceNumber} • ${Number(dispute.disputedAmount || 0).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Created {format(new Date(dispute.createdAt), "MMM dd, yyyy")} • {dispute.attachmentCount} attachment(s)
                                        </p>
                                    </div>
                                    <Badge variant={
                                        dispute.status === "Open" ? "secondary" :
                                            dispute.status === "Under Review" ? "default" :
                                                dispute.status === "Resolved" ? "default" : "destructive"
                                    }>
                                        {dispute.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium text-lg">No disputes found</p>
                            <p className="text-sm text-muted-foreground mt-1">You have no active or past disputes.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
